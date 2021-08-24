let assert = require('assert');
/**
 * @function reqVal "request validation"
 * @param {!*} el, element to test, accepts any type.
 * @param {!string} the expected type (e.g. 'string', or 'boolean').
 * @param {!number} the expected maximum length.
 * @description This tests whether a parameter contains parentheses, is the correct
 * type and isn't over a certain lengh. It has basic validation for code ($, {}).
 * @todo possibly add a minimum length parameter to further
 */
exports.reqVal = function(el, expectedType, expectedLength, cleanAndReplace){
  console.log([...arguments]);
  if(el === ''){
    return el;
  }
  if(!el){
    return;
  }
  try{
    if(expectedType !== 'object'){
      let regex = /\$|{|}|\([()]/g;
      if(cleanAndReplace){
        if(regex.test(el)){
          return el.replace(regex, '');
        }
      }
      else if(regex.test(el)){
        throw new Error('User input contains unexpected parenthesis or a $: ' + el);
      }
    }
  }
    catch(err){
      console.error(err.stack);
      //stop further execution:
      return {error: 'Invalid input'};
  }

  try{
    //if(el.toString().length > expectedLength){
    if(el.length > expectedLength){
      throw new Error('User input is longer than expected at ' + el.toString());
    }
  }
    catch(err){
      console.error(err.stack);
      //stop further execution:
      return;
  }

  try{
    if(typeof (el) !== expectedType){
      throw new Error("Argument " + el + " must be a " + expectedType);
    }
  }
    catch(err){
      console.error(err.stack);
      return;
  }

  //assert.strictEqual(typeof (el), expectedType, "Argument " + el + " must be a " + expectedType);
  return el;

};
