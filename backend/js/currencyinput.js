/**
 * Currency input.
 * @class
 * @param {HTMLelement} input element to enter value.
 * @param {sting} ISO currency code e.g. EUR
 * @summary Displays a currency correctly.
 * @description Formats input as currency, return an interger
 * @example new currencyinput(document.querySelector('.currency'), 'EUR');
 */
function CurrencyInput(target, currency){
  
  target.addEventListener("input",(e)=>{
    e.target.focus();
    formatCurrency(target);
    taxfn();
  });

  target.parentElement.parentElement.querySelector('.tax').addEventListener('input', (e)=>{
    taxfn();
  });

  let cent = 0;

  this.incent = ()=>{
    return cent;
  };

  this.formatOnly = (number, currency)=>{
    formatGivenNumber(number, currency);
  }

  function taxfn(){
      let tax = parseInt(target.parentElement.parentElement.querySelector('.tax').value);
      let taxdiv = target.parentElement.parentElement.querySelector('.taxCalc');
          val = Math.round(cent - ((cent / (100 + tax)) * 100));
          taxdiv.textContent = formatGivenNumber(val, currency);

  }

  function formatGivenNumber(number, currency){
    let ar = number.toString().split('');
    if(ar.length ===1) ar.splice(ar.length -2, 0, '0');
    ar.splice(ar.length -2, 0, '.');
    if(ar.length > 6){
      for(let i = 6; i < ar.length; i+=4){
        ar.splice(ar.length-i, 0, ' ');
      }
    }
    st = ar.join('');
    return currency + ' ' + st;
  }

  this.resolveInCent = (div)=>{
    //pass div
    let num = div.textContent.match(/\d+/g);
    let ar = num.join('').split('');
    let digitCount = num.join('');
    return digitCount;
  };

  function formatCurrency(targetEL){
    if(targetEL.textContent.length === 0){
      return;
    }

    let num = targetEL.textContent.match(/\d+/g);
    let ar = num.join('').split('');
    let digitCount = num.join('');

    /*  Moves the last digit entered to the end of the array, keeping the length the same
     *  by removing the first index with shift
     */

    ar.splice(ar.length, 0, ar[0]);
    ar.shift();

    cent = ar.join('');

    if(digitCount.length === 1){
      ar.splice(0, 0, '.0');
    }

    if(ar[0] === '0' && ar.length ===3){
      ar.shift();
    }

    if(digitCount.length >2){
      ar.splice(ar.length-2, 0, '.');
    }

    if(ar.length >= 6){
      for(i = 6; i < ar.length;){
        ar.splice(ar.length -i, 0, ' ');
        i+=4;
      }
    }

      targetEL.textContent = currency + ' ' + ar.join('');
      targetEL.dataset.incent = cent;

  }


  target.addEventListener('keydown', function(e) {
    const key = e.key; // const {key} = event; ES6+
    if (key === "Backspace" || key === "Delete") {
      let str = target.textContent;
      target.textContent = str.slice(0, 4) + str.slice(5, str.length);
      if(str.length === 7){
        target.textContent = str.slice(0, 4) + str.slice(8, str.length);
      }
    }else{

    }
  });
}
