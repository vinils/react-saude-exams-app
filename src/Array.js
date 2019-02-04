import {LoadFunctions as LoadDictionaryFunctions} from "./Dictionary";

function GroupBy(array, callBackFn) {
    let ret = {}
    array.forEach(element => {
      let key = callBackFn(element)
      if(!ret[key]) {

        ret[key] = []
      }

      ret[key].push(element)
    })

    LoadDictionaryFunctions(ret);

    return ret;
}

function Distinct(array) {
    return array.filter((value, index, self) => self.indexOf(value) === index)
}

function LoadPrototype() {
    Array.prototype.GroupBy = function(callBackFn) {
      return GroupBy(this, callBackFn)
    }

    Array.prototype.Distinct = function() {
      return Distinct(this)
    }
}

export {LoadPrototype, Distinct, GroupBy};