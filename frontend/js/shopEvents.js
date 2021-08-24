function NumberChooser(){
  let number, val;

  this.attach = function attach(parent, increment, max, min, extraEvent){
    number = parent.querySelector('.plus').previousSibling.firstChild,
    val = parseInt(number.textContent);

    parent.querySelector('.plus').addEventListener('click', function(){
      if(max !== null && typeof max !== "undefined"){
        if( val < max){
          val += increment;
          number.textContent = val;
        }
      }else{
        val += increment;
        number.textContent = val;
      }
      extraEvent(val);
    });

    parent.querySelector('.minus').addEventListener('click', function(){
      if(min !== null && typeof min !== "undefined"){
        if(val > min){
          val -= increment;
          number.textContent = val;
        }
      }else{
        val -= increment;
        number.textContent = val;
      }
      extraEvent(val);
    });
    return this;
  }

  this.value = function(){
    return val;
  }
}

function shopEvents(){
  customEvents();
  window.history.pushState({page: '0'}, '', window.location);
  /**Loads background images dynamically without violating CSP**/
  Array.from(document.querySelectorAll('[data-backgroundImage]')).forEach((item, i) => {
    //style="background-image: url('"+ismageLink+"');
    item.style.backgroundImage = "url(\""+item.dataset.backgroundimage+"\")";
  });
}

function panelPrice(height, width){
  if(height > 0 && width > 0){
    let size = height * width,
        pricePerTile = 2000,
        tileCount = size / (15*15),
        price =  tileCount * pricePerTile;
    return price
  }
}

function imperial(cm){
  let feet = cm*0.032808;
  let inches = ((feet%1*100)/12).toPrecision(2);
  let text = '';
  if(feet >1){
    text += feet.toString().split('.')[0] + '\' ' + inches +'\"';
  }
  else{
    text += inches +'\"';
  }
  return text;
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
