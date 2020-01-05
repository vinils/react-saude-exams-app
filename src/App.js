import React, { Component } from 'react';
import {TreeTable} from '@vinils/react-table'

export default class App extends Component {
  constructor (props) {
    super(props)
        
    this.state = {
        search: (line) => true,
        data: null,
        keys: null
    }

    // Date.prototype.formatToYYYY_MM_DD = function () {
    //   return this.dateFormatToYYYY_MM_DD(this);
    // }

    // Date.prototype.formatToDD_MM_YY = function() {
    //   return this.dateFormatToDD_MM_YY(this)
    // }

    // Array.prototype.GroupBy = function(callBackFn) {
    //   return this.arrayGroupBy(this, callBackFn)
    // }

    // Array.prototype.Distinct = function() {
    //   return this.arrayDistinct(this)
    // }

    let castTree = (treeNode, childName, callBackFn) => {
      if(!treeNode) {
        return null;
      }

      return {
        ...callBackFn(treeNode),
        [childName]: treeNode[childName].map(child => castTree(child, childName, callBackFn))
      }
    }

    const odataUrl = window.location.protocol + '//' + process.env.REACT_APP_DATA_POINT
    const oataGroupsUrl = odataUrl + '/groups'
    const examsId = '98B34F14-6DAA-3EE4-4EB1-E6D4F691960E'
    // const examsUrl = oataGroupsUrl + `?$filter=Id eq ${examsId}&$expand=Childs($levels=max;$expand=Datas($expand=Data.Models.DataDecimal/LimitDenormalized,Data.Models.DataString/LimitDenormalized))`
    const examsUrl = oataGroupsUrl + `/ChildsRecursively?groupId=${examsId}`
    fetch(examsUrl)
    .then(res => res.json())
    .then(json => {
      console.log(json)
      console.log(JSON.parse(json.value))
      console.log(JSON.parse(json.value)[0])
      let groupExams = JSON.parse(json.value)[0];
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

        if(group.Datas) {
          let groupedExamsByDate = this.arrayGroupBy(group.Datas, e => this.dateFormatToYYYY_MM_DD(new Date(e.CollectionDate)) + "T00:00:00");

          keys = keys.concat(groupedExamsByDate.keys())

          let groupedExamsByDateCasted = groupedExamsByDate
            .cast((eg, key) => ({[key]: this.valueCol(eg[0])}))

          ret = {
            ...ret, 
            ...groupedExamsByDateCasted
          }

          let limits = group.Datas
          .map(e=> this.getLimitDescription(e))
          .filter(l => l != null || l !== '');

          if(!ret.LimitDescription) {
            ret.LimitDescription = limits[0];
          }
        }

        return ret;
      })

      this.setState({data: exams, keys: this.arrayDistinct(keys)})
    })
  }

  groupedDictionaryForEach = (dictionary, callBackFn) => {
    Object.keys(dictionary).forEach((key, index) => {
      let elements = dictionary[key]; 
      if(!Array.isArray(elements)) {
        return;
      } else {
        callBackFn(elements, key)
      }
    })
  }

  groupedDictionaryCast = (dictionary, callBackFn) => {
    let ret = {}

    dictionary.forEach((elements, key) => 
      ret = {...ret, ...callBackFn(elements, key)}
    );

    return ret;
  }

  dateFormatToYYYY_MM_DD = (date) => {
    let month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  dateFormatToDD_MM_YY = (date) => {
    let month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year-2000].join('/');
  }

  arrayGroupBy = (array, callBackFn) => {
    let ret = {}
    array.forEach(element => {
      let key = callBackFn(element)
      if(!ret[key]) {

        ret[key] = []
      }

      ret[key].push(element)
    })

    if(!ret.forEach) {
      ret.forEach = (callBackFn) => this.groupedDictionaryForEach(ret, callBackFn);
    }
    if(!ret.cast) {
      ret.cast = (callBackFn) => this.groupedDictionaryCast(ret, callBackFn);
    }
    if(!ret.keys) {
      ret.keys = () => Object.keys(ret).filter(k => Array.isArray(ret[k]))
    }
    return ret;
  }
  
  arrayDistinct = (array) => {
    return array.filter((value, index, self) => self.indexOf(value) === index)
  }

  getLimitDescription(exam) {
    let limitDescription = '';

    switch(exam["@odata.type"]) {
      case "#Data.Models.DataDecimal":
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
      case "#Data.Models.DataString":
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

    switch(exam["odata.type"]){
      case "Data.Models.DataDecimal":
        value = exam.DecimalValue;
        color = exam.LimitDenormalized ? exam.LimitDenormalized.Color : null;
        break;
      case "Data.Models.DataString":
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
    let mappedDates = datesSorted.map((date) => {return {description: <center><b>{this.dateFormatToDD_MM_YY(new Date(date))}</b></center>, name: date}})
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
