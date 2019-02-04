function ForEach(dictionary, callBackFn) {
    Object.keys(dictionary).forEach((key, index) => {
        let elements = dictionary[key]; 
        if(!Array.isArray(elements)) {
            return;
        } else {
            callBackFn(elements, key)
        }
    })
}

function Cast(dictionary, callBackFn) {
    let ret = {}

    dictionary.forEach((elements, key) => 
        ret = {...ret, ...callBackFn(elements, key)}
    );

    return ret;
}

function LoadFunctions(dictionary) {
    if(!dictionary.forEach) {
        dictionary.forEach = (callBackFn) => ForEach(dictionary, callBackFn);
    }
    if(!dictionary.cast) {
        dictionary.cast = (callBackFn) => Cast(dictionary, callBackFn);
    }
    if(!dictionary.keys) {
        dictionary.keys = () => Object.keys(dictionary).filter(k => Array.isArray(dictionary[k]))
    }
}
export {LoadFunctions, Cast, ForEach};