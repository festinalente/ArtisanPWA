let assert = require('assert');
/**
 * @function reqVal "request validation"
 * @param {!*} el, element to test, accepts any type.
 * @param {!string} the expected type (e.g. 'string', or 'boolean').
 * @param {!number} the expected maximum length.
 * @description This tests whether a parameter contains parentheses, is the correct
 * type and isn't over a certain lengh. It has basic validation for code ($, {}). It resolves a promise and simply strips code.
 * @todo possibly add a minimum length parameter to further
 */
exports.reqVal = function(el, expectedType, expectedLength){
  let promise = new Promise((resolve, reject)=>{
    //content
    try{
      if(expectedType !== 'object'){
        let regex = /\$|{|}|\([()]/g;
        let rep = el.replace(regex, '');
        resolve(rep);
      }
      //string
      if(el.length > expectedLength){
        reject({error: 'User input is longer than expected at ' + el.toString()});
      }
      //typeof
      if(typeof (el) !== expectedType){
        reject({error: "Argument " + el + " must be a " + expectedType});
      }
    }
    catch(err){
      console.error(err.stack);
      reject({error: 'Input error'});
    }

  });
  return promise;
};
