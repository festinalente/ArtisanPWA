exports.any = function any(testsubjects, keyvalue){
  return testsubjects.includes(keyvalue);
};

exports.termTest = function tests(term, testParamaters){
  for(let i = 0; i < testParamaters.length; i++){
    return (term >= testParamaters[i]) ? true : false;
  }
};
