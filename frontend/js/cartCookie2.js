/*file layout: first dom content loaded actions, then events via delegation, then functions*/

//On load
document.addEventListener("DOMContentLoaded", function(event) {
  //cart.fetchCartData();
  changeEvents();
  //setBySessionStore();
});

( ()=>{
  let fullItems = [];
  let cartOb = {
    sessionID: '',
    cartcode: '',
    itemrefs: [],
    shippingDestination: '',
    status: {}
  }

  cart = {
    expose: ()=>{
      
    },

    /**
     * Add to cart method
     * @param {Object} The item to save
     * @param {number} The number of items of this type.
     * @description When there are multiple items selected several copies of
     * the same item are added.
     */
    add: function(target, count){
      
      let items = JSON.parse(target.dataset.itemrefs);
      for (let i = 0; i < count; i++){
        let removed = items.splice(0, 1)
        target.dataset.itemrefs = JSON.stringify(items);
        cartOb.itemrefs.push(removed[0]);
      }
      return this;
    },

    remove: function(item, count){
      let index = cartOb.itemrefs.indexOf(item);
      cartOb.itemrefs.splice(index, 1);
      return this;
    },

    fetchCartData: function(){
      xhr(cartOb, '/fetchCartData', function(response){
        fullItems = JSON.parse(response);
        if(fullItems[0]){
          assign(cartOb, fullItems[0].cart);
          setBySessionStore(fullItems[0].cart.shippingDestination)
        }
      });
      return this;
    },

    fetchView: function(){
      xhr(cartOb, '/fetchCartView', function(response){
        setCartView(response);
      });
      return this;
    },

    addBespokeItem: function(e){
      let custom = {};
      let criteria = new URLSearchParams(window.location.search);
      for (let p of criteria) {
        custom[p[0]] = p[1];
      }
      //make this dynamic to add other types of item:
      custom.itemtype = 'tiles';
      custom.price = parseInt(document.querySelector('#panelValue').textContent.replace( /\D+/g, ''));
      custom.theme = Object.keys(custom)[0].replace('_colours', '');
      custom.colours = Object.values(custom)[0].split('_');
      custom.cart = cartOb;
      custom.quantity = 1;

      gthing = custom;

      xhr(custom, '/bespokeOrder', function(response){
        assign(cartOb, JSON.parse(response));
        yestick(e.target);
        //countDownTimer(document.querySelector('.shoppingCartModal'), 30*60*1000);
        //setCartView(response);
      });
      return this;
    },

    updateOnServer: function(done){
      cartOb.shippingDestination = sessionStorage.shippingDestination;
      xhr(cartOb, '/updateCart', function(response){
        assign(cartOb, JSON.parse(response));
        cart.fetchView();
        //countDownTimer(document.querySelector('.shoppingCartModal'), 30*60*1000);
      });
      return this;
    },

    returnCartCode: function(){
      return cartOb.cartcode;
    }
  }

  function assign(target, donor){
    let keys = Object.keys(target);
    keys.forEach((item, i) => {
      target[item] = donor[item];
    });
  }

  function countDownTimer(target, interval){
    let timeup = new Date().getTime() + interval;
    let x = setInterval(function() {
      let distance = timeup - new Date().getTime();
          minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds = Math.floor((distance % (1000 * 60)) / 1000);

          target.querySelector(".timer").innerHTML = "Your cart will expire after " + minutes + "m " + seconds + "s of inaction.";

      if (distance < 0) {
         clearInterval(x);
         target.querySelector(".timer").innerHTML = "Your cart has expired.";
      }
    }, 1000);
  }

  function setCartView(response){
    let cartView = document.querySelectorAll('.shoppingCartModal');
      for (let i = 0; i < cartView.length; i++) {
        //load content
        cartView[i].innerHTML = response;
        //modal is a part of content:
        let targetModal = cartView[i].querySelector('.modal');
            targetModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            toggle.setinst(targetModal);

        //attach close event:
        targetModal.querySelector('.circleClose').addEventListener('click', ()=>{
          toggle.tog(targetModal, 'none');
          document.body.style.overflow = 'scroll';
          document.querySelector('body').style.position = 'unset';
        });

      if(i === cartView.length -1){
        changeEvents();
      }
    }
  }

  cart.fetchCartData();

  }
)();

function setPhoneCode(val){
  let phonecode = $('#clientDetails') && $('#clientDetails').querySelector('#countrycode');
  if(phonecode){
    phonecode.querySelectorAll('option').forEach((item, i) => {
      if(item.dataset.countrycode === val){
        //safari:
        item.selected = true;
        //the rest:
        item.setAttribute('selected', 'selected');
      }
    });
  }
}

function setBySessionStore(setFromServer){

  function set(shippingDestination){
    let val = (shippingDestination && shippingDestination.includes('|')) ? shippingDestination.split('|')[0] : null;
    setPhoneCode(val);
    setCountryVal(shippingDestination);
  }

  if(sessionStorage.shippingDestination){
    set(sessionStorage.shippingDestination)
  }
  else if(setFromServer){
    set(setFromServer);
  }
  else{
    return;
  }
}

function setCountryVal(val){
  let els = document.querySelectorAll('.country');
  els.forEach((option,i)=>{
    option.querySelectorAll('option').forEach((item, i) => {
      if(item.value === val){
        //safari:
        item.selected = true;
        //all the rest:
        item.setAttribute('selected', 'selected');
      }
    });
  });
}


function changeEvents(){
  //if exists?
  if(document.querySelector('.country')){

    Array.from(document.querySelectorAll('.country')).forEach((item, i) => {
      if(item){
        item.addEventListener('change', function(e){
          e.preventDefault();
          sessionStorage.shippingDestination = e.target.value;
          cart.updateOnServer();
          let val = e.target.value.split('|')[0];
          setPhoneCode(val);
          setCountryVal(e.target.value);
          if(document.querySelector('.shippingDestinationLabel')){
            document.querySelector('.shippingDestinationLabel').scrollIntoView({block: 'start',  behavior: 'smooth' });
          }
        });
      }
    });
  }
}

function yestick(target){
  target.parentElement.querySelector('.yestick').classList.add('paynowAnimate');
  target.previousSibling.classList.add('opacityOne');
  target.firstChild.textContent = 'Added to cart';
}

document.addEventListener('click', function(e){
  if(e.target.classList.contains('addToCartBtn')){
    //node only works in modal dialog!
    let count = parseInt(e.target.closest('.modalContent').querySelector('.quantityInput').textContent);
    cart.add(e.target, count).updateOnServer();
    yestick(e.target);
  }

  if(e.target.classList.contains('addBespokeCartBtn')){
    cart.addBespokeItem(e);
  }

  if(e.target.classList.contains('removeFromCart'))  {
    cart.remove(e.target.dataset.itemref).updateOnServer();
  }

  if(e.target.classList.contains('shoppingCart')){
    cart.fetchView();
  }

  if(e.target.classList.contains('toCheckout')){
    document.querySelector('.cart').scrollIntoView({block: 'start',  behavior: 'smooth' });
    document.querySelector('.cart').classList.add('bounce');
  }
}); //closes event delegation

function updateCartCount(){
  var items = document.getElementsByClassName('checkoutItem').length;
  var cart = document.getElementById('cartCount');
  if(items > 0){
    cart.style.display = 'block';
    cart.innerHTML = items;
  }
  if(items === 0){
    cart.style.display = 'none';
    cart.innerHTML = '0';
  }
}

function updatePurchasedCount(){
  var items = document.getElementsByClassName('purchasedItem').length;
  var cart = document.getElementById('bookingCount');
  if(items > 0){
    cart.style.display = 'block';
    cart.innerHTML = items;
  }
  if(items === 0){
    cart.style.display = 'none';
    cart.innerHTML = '0';
  }
}
