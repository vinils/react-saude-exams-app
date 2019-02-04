import React, { Component } from 'react';
import {TreeTable} from '@vinils/react-table'
import {LoadPrototype as LoadArrayPrototype} from './Array';
import {LoadPrototype as LoadDatePrototype} from './Date';
import {Cast as dictionaryCast} from './Dictionary';

export default class App extends Component {
  constructor (props) {
    super(props)
        
    this.state = {
        search: (line) => true,
        data: null,
        keys: null
    }

    LoadDatePrototype();
    LoadArrayPrototype();

    let castTree = (treeNode, childName, callBackFn) => {
      if(!treeNode) {
        return null;
      }

      return {
        ...callBackFn(treeNode),
        [childName]: treeNode[childName].map(child => castTree(child, childName, callBackFn))
      }
    }

    const odataUrl = 'http://mypc01.ddns.net/data/odata/v4'
    const oataGroupsUrl = odataUrl + '/groups'
    const examsId = '98B34F14-6DAA-3EE4-4EB1-E6D4F691960E'
    const examsUrl = oataGroupsUrl + `?$filter=Id eq ${examsId}&$expand=Childs($levels=max;$expand=Exams($expand=Data.Models.ExamDecimal/LimitDenormalized,Data.Models.ExamString/LimitDenormalized))`
    fetch(examsUrl)
    .then(res => res.json())
    .then(json => {
      let groupExams = json.value[0];
      groupExams.cast = (callBackFn) => castTree(groupExams, 'Childs', callBackFn);

      let keys = []
      let exams = groupExams.cast(group => {
        let ret = {
          Id: group.Id,
          Name: group.Name,
          Initials: group.Initials,
          MeasureUnit: group.MeasureUnit,
          ParentId: group.ParentId
        }

        if(group.Exams) {
          let groupedExamsByDate = group.Exams.GroupBy(e => new Date(e.CollectionDate).formatToYYYY_MM_DD() + "T00:00:00");

          keys = keys.concat(groupedExamsByDate.keys())

          let groupedExamsByDateCasted = dictionaryCast(groupedExamsByDate, (eg, key) => ({[key]: this.valueCol(eg[0])}))

          ret = {
            ...ret, 
            ...groupedExamsByDateCasted
          }

          let limits = group.Exams
          .map(e=> this.getLimitDescription(e))
          .filter(l => l != null || l !== '');

          if(!ret.LimitDescription) {
            ret.LimitDescription = limits[0];
          }
        }

        return ret;
      })

      this.setState({data: exams, keys: keys.Distinct()})
    })
  }

  getLimitDescription(exam) {
    let limitDescription = '';

    switch(exam["@odata.type"]) {
      case "#Data.Models.ExamDecimal":
        let limitDecimal = exam.LimitDenormalized;
        if(limitDecimal) {
          if(limitDecimal.Name) {
            limitDescription += limitDecimal.Name + ":"
          }

          if(limitDecimal.MinType === "BiggerThan") {
            limitDescription += " > " + limitDecimal.Min;
          } else if(limitDecimal.MinType === "EqualsOrBiggerThan") {
            limitDescription += " >= " + limitDecimal.Min;
          }

          if(limitDecimal.MinType && limitDecimal.MaxType) {
            limitDescription += " e"
          }

          if(limitDecimal.MaxType === "SmallThan") {
            limitDescription += " < " + limitDecimal.Max;
          } else if(limitDecimal.MaxType === "SmallOrEqualsThan") {
            limitDescription += " <= " + limitDecimal.Max;
          }
        }
        break;
      case "#Data.Models.ExamString":
        let limitString = exam.LimitDenormalized;
        limitDescription = limitString ? limitString.Expected : null
        break;
      default:
    }

    return limitDescription;
  }

  valueCol(exam) {
    let value = null;
    let color = null;

    switch(exam["@odata.type"]){
      case "#Data.Models.ExamDecimal":
        value = exam.DecimalValue;
        color = exam.LimitDenormalized ? exam.LimitDenormalized.Color : null;
        break;
      case "#Data.Models.ExamString":
        value = exam.StringValue;
        color = exam.LimitDenormalized ? exam.LimitDenormalized.Color : null;
        break;
      default:
        throw new Error("exam type not identified")
    }

    return <div style={color ? {backgroundColor: '#' + color.toString(16)} : null}><center>{value}</center></div> 
  }

  handleFilterChange = (value) => {
    if(!value) {
      this.setState({search: (line) => true})
    } else {
      this.setState({search: (line) => line.Name.toLowerCase().indexOf(value.toLowerCase()) >= 0})
    }
  }

  headColumns() {
    const searchHead = (<div>Nome<br/><input size={10} onChange={(e) => this.handleFilterChange(e.target.value)}/></div>)
    let dates = this.state.keys
    let datesSorted = dates.sort((str1, str2) => new Date(str2) - new Date(str1))
    let mappedDates = datesSorted.map((date) => {return {description: <center><b>{new Date(date).formatToDD_MM_YY()}</b></center>, name: date}})
    return [
        {description: <b>{searchHead}</b>, name: 'Name'},
        ...mappedDates,
        {description: <center><b>Un</b></center>, name: 'MeasureUnit'}, 
        {description: <b>Referência</b>, name: 'LimitDescription'}, 
    ]
  }

  getChilds(line) {
      return line.Childs
  }
  
  render() {
    if(!this.state.data) {
      return <label>Loading...</label>;
    } else {
      return (
          <TreeTable
            expand={false}
            style={{borderCollapse: 'collapse',
              borderSpacing: 0,
              width: '100%',
              border: '1px solid #ddd',
              row: {nthChild: '#f2f2f2'}}}
              head={this.headColumns()}
            getChilds={this.getChilds}
            filter={this.state.search}>
              {this.state.data.Childs}
          </TreeTable>
      );
    }
  }
}
