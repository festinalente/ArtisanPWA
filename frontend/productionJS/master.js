let activateDropDown = (function(){
	let dropdownState = {},
 			allTargetNodes,
 			selection;

	 return {
		setState : function(dropdownName){
			
			//e.g. bike profifle .itemType
			//e.g. #itemType
			let dropdown = document.getElementById(dropdownName);
			//whatever is selected, values will always match
			selection = dropdown.options[dropdown.selectedIndex].dataset.attribute;
			
			dropdownState[dropdownName] = selection;

			return this;
		},
		hideOrDisplay : function(){
			let keys = Object.values(dropdownState);
			let allTargetNodes = document.querySelectorAll('.itemprofile');
			
			allTargetNodes.forEach(function(node){
				let rank = 0;
        let val = (typeof node.dataset.topics === 'object' && node.dataset.topics !== null) ? node.dataset.topics : JSON.parse(node.dataset.topics);
				let nodeDataset = Object.values(val);
				
				keys.forEach(function(e,index){
					if(nodeDataset.includes(e) || e === undefined){
						//undefined refers to 'ignore this aspect'
						rank++;
					}
					else{
						//rank = false;
					}
					if(index === keys.length-1){
						if(rank === keys.length){
							

							//test if table or div
							if(document.querySelectorAll('.itemprofile')[0].tagName === 'DIV'){
								node.style.display = 'flex';
							}
							else{
								node.style.display = 'table-cell';
							}
						}
						else{
							node.style.display = 'none';
						}
					}
				});
			});
		}
	}
})();
document.querySelectorAll('.fetchpost').forEach(function(e){
  e.addEventListener('click', function(evt){
    var link = evt.target.parentElement.dataset.title;
    window.location.pathname = '/blog/' + link;
  });
});
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
function customEvents(){

};
//the fourth parameter *classes* takes an array of class names without the dot, e.g.
//['backendh4']

(function scopeItIn(){
  var nodeFamily = [];
    domadd = {
      append: function(NodeType, Content, Parent, Classes, Id, Attributes, Nest){
        var el = document.createElement(NodeType);

        if(Content){
          el.textContent = Content;
        }

        if(Classes){
          Classes.forEach(function(c) {
            el.classList.add(c);
          });
        }

        if(Id){
          el.id = Id;
        }
        //attributes takes an array of objects with value key equating to attr and val
        //6th argument
        if(Attributes){
          Attributes.forEach(function(a, count) {
            el.setAttribute(Object.keys(a)[0], a[Object.keys(a)[0]]);
          });
        }
        if(Parent instanceof Element || Parent  instanceof HTMLDocument){
          Parent.append(el);
        }
        else if(Parent === 'ChildOfPrev'){
          nodeFamily[nodeFamily.length-1].append(el);
        }
        else{
          document.querySelector(Parent).append(el);
        }

        nodeFamily.push(el);

        return this;
      }
    };
      return domadd;
  }
)();
const folder2 = {
  btns : document.getElementsByClassName('btnnext'),
  pages : document.getElementsByClassName('page'),
  //@param {number}


  shortcut : (number)=>{
      if(typeof number !== 'number'){
        number = parseInt(number);
      }

      for(var i = 0; i < folder2.pages.length; i++){
        if(i === number){
          folder2.pages[i].classList.remove('reduce');
          folder2.pages[i].classList.add('focus');
          //folder2.pages[i].style.display = 'block';
        }
        else{
          folder2.pages[i].classList.add('reduce');
          folder2.pages[i].classList.remove('focus');
          folder2.pages[i].scrollIntoView({block: 'start',  behavior: 'smooth' });
        }

      }
    },

    shortcutnextpage : (nextpage)=>{
      
      /*
      let address = '';
      for(var i = 0; i < folder2.pages.length; i++){
        if(folder2.pages[i].dataset.address.includes(nextpage)){
          address = folder2.pages[i].dataset.address;
          break;
        }
      }*/
      setRelCanonical();
      for (var i = 0; i < folder2.pages.length; i++) {
        if(folder2.pages[i].dataset.address === nextpage){
          folder2.pages[i].classList.remove('reduce');
          folder2.pages[i].classList.add('focus');
          //folder2.pages[i].style.display = 'block';
        }
        else{
          //folder2.pages[i].classList.add('reduce', 'focus');
          folder2.pages[i].classList.add('reduce');
          folder2.pages[i].classList.remove('focus');
        }
      }

    }
}

function getAddressByFetchThis(fetchthis){
  return document.querySelector('[data-name="'+fetchthis+'"]').dataset.address;
}

function getNextPageInArray(currentAdress){
  let next = currentAdress.split('|');
  let nextInt = parseInt(next[next.length-1]) + 1;
      next[next.length-1] = nextInt;
  let nextSt = next.join('|');

  if(document.querySelector('[data-address="'+nextSt+'"]')){
    return document.querySelector('[data-address="'+nextSt+'"]').dataset.address;
  }else{
    return console.warn('Error, page doesn\'t exit');
  }
}

function addParam(key, value, address){
  
  let urlint = new URL(window.location.href);
  if(Array.from(urlint.searchParams).length > 0){
    if(urlint.searchParams.has(key) + '_choice'){
      
      urlint.searchParams.set(key, value);
      //urlint = new URL(window.location.href + key + value);
      window.history.replaceState({page: address}, '', urlint);

    }
    else{
      key = '&' + key;
      value = '_choice=' + value;
      urlint = new URL(window.location.href + key + value);
      window.history.pushState({page: address}, '', urlint);

    }
  }
  else{
    if(urlint.searchParams.has(key) + '_choice'){
      urlint.searchParams.set(key, value);
      
      //urlint = new URL(window.location.href + key + value);
      window.history.replaceState({page: address}, '', urlint);

    }
    else{
      key = '?' + key;
      value = '_choice=' + value;
      
      urlint = new URL(window.location.href + key + value);
      window.history.pushState({page: address}, '', urlint);

    }
  }
}

Array.from(document.getElementsByClassName('btnnext')).forEach((btn, i) => {

  btn.addEventListener('click', function(e){
    let nextpage = getNextPageInArray(btn.closest('.page').dataset.address);
        btn.dataset.nextpage = nextpage;

    if(btn.dataset.fetchthis && btn.dataset.nextpage === 'undefined'){
      
      let url = new URL(window.location.href + '/' + btn.dataset.linktext.replace(/ /gi, '_'))
      window.history.pushState({page: getAddressByFetchThis(btn.dataset.fetchthis)}, '', url);

      folder2.shortcutnextpage(getAddressByFetchThis(btn.dataset.fetchthis));
    }
    else if(btn.dataset.parameter && btn.dataset.nextpagename){
      console.warn('nextpagename is an analog of fetchthis used for param choices');
      let nextpagelink = '/' + btn.dataset.nextpagename.replace(/ /gi, '_'),
          nextpageaddress = getAddressByFetchThis(btn.dataset.nextpagename);

      let key, value;

          key = btn.closest('.page').dataset.name.toLowerCase();
          value = btn.dataset.parameter.toLowerCase().replace('and ', '').replace(',', '').replace(/ /gi, '_');
          addParam(key, value, nextpageaddress);

      //window.history.pushState({page: nextpageaddress}, '', url);
      folder2.shortcutnextpage(nextpageaddress);
    }
    //get by address
    else{
      let url = new URL(window.location.href + '/' + document.querySelector('[data-address="'+nextpage+'"]').dataset.name.replace(/ /gi, '_'))
      window.history.pushState({page: btn.dataset.nextpage}, '', url);

      folder2.shortcutnextpage(btn.dataset.nextpage);
    }

    document.querySelector("body").scrollIntoView({block: 'start',  behavior: 'smooth' });

  });
});

  if(!!window.IntersectionObserver){
  	let observer = new IntersectionObserver((entries, observer) => {
  		entries.forEach(entry => {
        if(!entry.target.nextSibling.classList){
          console.warn(entry.target);
          console.warn('has no nextSibling');
        }
  		if(entry.isIntersecting){
        entry.target.classList.add('background0');
        entry.target.classList.remove('background1');
        entry.target.nextSibling.classList.add('moveText');
  		}else{
        entry.target.classList.add('background1');
        entry.target.classList.remove('background0');
        entry.target.nextSibling.classList.remove('moveText');
      }
  		});
  	}, {rootMargin: "0px 0px -80% 0px"});

  	document.querySelectorAll('.overlay1').forEach(el => { observer.observe(el) });
  }

function updateState(baseapp, page, theme, item, title, url){
  let promise = new Promise((resolve, reject)=>{
    
    window.history.pushState({
      //app that requires page bluffing e.g. 'shop'
      baseapp: baseapp,
      page: page,
      theme: theme,
      item: item,
    }, title, url);

    resolve();
  });
  return promise;
}

function itemModalToggle() {
  
  let promise = new Promise((resolve, reject)=>{
    if(window.history.state.item !== ''){
      openModal(window.history.state.page, document.querySelector('.' + window.history.state.item + '-modal'), window.history.state.item)
    }
    resolve();
  });
  return promise;
}

function setRelCanonical(item, theme){
  
  let ar = window.location.pathname.split('/');
  

  //if it isn't a theme page, point the rel cannonical to the theme:
  if(ar.length > 4 && !ar.includes('themes')){
    if(ar.includes('shapes')){
      document.querySelector('link[rel="canonical"]').href = window.location.origin + '/shop/themes/' + ar[4].replace(' ', '_')  + '/' + ar[5].replace(' ', '_');
    }
    if(ar.includes('types')){
      
      document.querySelector('link[rel="canonical"]').href = window.location.origin + '/shop/themes/' + ar[4].replace(' ', '_')  + '/' + ar[5].replace(' ', '_');
    }
  }else{
    document.querySelector('link[rel="canonical"]').href = window.location.href;
  }
}

function setStateFromPath(path){
  let ar = path.split('/')
  if(ar.includes('shop') && !window.location.search){
    let focused = document.querySelector('.focus:not(.reduce)'),
        theme = (focused.dataset.name) ? focused.dataset.name : '',
        page = focused.dataset.address,
        item = (ar[4]) ? ar[4] : '',
        title = theme + ' ' + item;
    updateState('shop', page, theme, item, title, path).then((e)=>{
      setRelCanonical(item, theme);
      //setRelCanonical();
    });
    //.then(itemModalToggle);
    //.itemModalToggle(page, item);
  }
}

window.onpopstate = function(e){
  
  //document.querySelector
  folder2.shortcutnextpage(window.history.state.page);
};

/*{
  page: page,
  item : targetModal.dataset.item,
  theme : window.location.pathname.split('/')[3]
}, '', window.location  +'/'+ targetModal.dataset[themeOrItem].replace(/ /gi, '_')*/
/**
  * @param {string} parent -Takes a query selector string e.g. '.imagescroller' unique to the div you want  to display the scroller
  * @param {array} imageLinks -Takes an array of links (try it with locally hosted images on codepen)
  * @description A simple image scroller that can be called up in a one liner. The CSS is all nested in the imagescroller class to avoid
  poluting the name space. Changed to a constructor in April 2020
  */

  /*
    var patterns = new MakeScroller();
      patterns.build('.patternscroller', [
        'https://www.porchespottery.com/images/bbdesign_slider/artichoke.jpg',
        'https://www.porchespottery.com/images/bbdesign_slider/primavera.jpg',
        'https://www.porchespottery.com/images/bbdesign_slider/lilyflower.jpg'
      ]);
  */
function MakeScroller(){
  var imageLinks;
  var parent;
  var imageIndex = 0;
  var imgs = [];

  this.build = function(p, links){
    parent =  (typeof p === 'string') ? document.querySelector(p) : p;
    imageLinks = links;


    var base = document.createElement('div');
        base.classList.add('basedimensions');

    parent.append(base);
    parent.classList.add('imagescroller');

    var btncontainer = document.createElement('div');
        btncontainer.classList.add('btncontainer');

    var rightArrow = document.createElement('div');
        rightArrow.classList.add('rightarrow');

    var leftArrow = document.createElement('div');
        leftArrow.classList.add('leftarrow');

    imageLinks.forEach(function(e, i){

      var img = document.createElement('img');

          img.setAttribute('src', e);
          if(i === 0){
            img.classList.add('imgfit');
          }
          base.appendChild(img);
          imgs.push(img);

      var imgbtn = document.createElement('div');
          imgbtn.classList.add('imgbtn');
          imgbtn.addEventListener('click', function(){
            imgs.forEach(function(e,i){
              e.classList.remove('imgfit');
              btncontainer.children[i+1].style.backgroundColor = '#333';
            });
            imgs[i].classList.add('imgfit');
            imageIndex = i;
            imgbtn.style.backgroundColor = '#fc3';

          });

      if(i === 0){
        btncontainer.appendChild(leftArrow);
      }

      btncontainer.appendChild(imgbtn);
      btncontainer.children[1].style.backgroundColor = '#fc3';

      if(i === imageLinks.length-1){
        btncontainer.appendChild(rightArrow);
        p.insertAdjacentElement('afterend', btncontainer);
      }

    });

      rightArrow.addEventListener('click', function(){

        imgs.forEach(function(e,i){
          e.classList.remove('imgfit');
          btncontainer.children[i+1].style.backgroundColor = '#fc3';
        });
        btncontainer.children[imageIndex+1].style.backgroundColor = '#333';
        imageIndex++;

        if(imageIndex === imgs.length){
          imageIndex = 0;
        }

        imgs[imageIndex].classList.add('imgfit');
      });

      leftArrow.addEventListener('click', function(){
        imgs.forEach(function(e,i){
          e.classList.remove('imgfit');
        });

        if(imageIndex === 0){
         imageIndex = imgs.length;
        }
        imageIndex--;

        imgs[imageIndex].classList.add('imgfit');
      });
  };
}
/**
  * @param {string} parent -Takes a query selector string e.g. '.imagescroller' unique to the div you want  to display the scroller
  * @param {array} imageLinks -Takes an array of links (try it with locally hosted images on codepen)
  * @description A simple image scroller that can be called up in a one liner. The CSS is all nested in the imagescroller class to avoid
  poluting the name space. Changed to a constructor in April 2020
  */
function MakeScroller2(){
  let imgDivs = [];
  let imageLinks,
      parent;

  this.build = function(p, links){
    imageLinks = links;
    parent = (typeof p === 'string') ? document.querySelector(p) : p;

    if(parent.firstChild){
      return;
    }

    let base = document.createElement('div');
        parent.appendChild(base);
        base.classList.add('basedimensions');

    let left = document.createElement('div');
        base.appendChild(left);
        if(imageLinks.length > 1){
          left.classList.add('left', 'imgScroller', 'scrollerArrowLeft');
        }
        else{
          left.classList.add('left', 'imgScroller');
        }

    let main = document.createElement('div');
        base.appendChild(main);
        main.classList.add('main', 'imgScroller');
        main.setAttribute('title', 'Click image to enlarge it, then click to shrink');

    let right = document.createElement('div');
        base.appendChild(right);
        if(imageLinks.length > 1){
          right.classList.add('right', 'imgScroller', 'scrollerArrowRight');
        }
        else{
          right.classList.add('right', 'imgScroller');
        }

    parent.appendChild(base);
    //parent.classList.add('imagescroller');

    function addImage(link){
      let img = document.createElement('img');
      img.setAttribute('src', link);
      img.setAttribute('alt', link);
      img.classList.add('smooth', 'imgScroller');
      imgDivs.push(img);
      return img;
    }

    function addVideo(link){
      let video = document.createElement('video');
      video.setAttribute('src', link);
      video.classList.add('smooth', 'imgScroller');
      imgDivs.push(video);
      return video;
    }

    for (let i = 0; i < links.length; i++) {
      let target;
      let source = window.location.hostname;
      if(links[i].split('.')[1] === 'mp4'){
        target = addVideo(links[i]);
      }else{
        target = addImage(links[i]);
      }

      if(base.children[i]){
        if(links.length === 1){
          base.children[1].appendChild(target);
          if(target.tagName === 'VIDEO'){
            target.controls = true;
          }
        }
        else{
          base.children[i].appendChild(target);
          if(target.tagName === 'VIDEO'){
            target.controls = true;
          }
        }
      }
    }

    base.querySelectorAll('.imgScroller').forEach((el)=>{
      el.addEventListener('click', (e)=>{
        e.stopPropagation();
        changeSrc(e.target);
      });
    });

    function toggleClasses(div){
      if(div.parentElement.classList.contains('fullScreenImg')){
        div.parentElement.classList.add('main');
        div.parentElement.classList.remove('fullScreenImg');

      }else{
        div.parentElement.classList.add('fullScreenImg');
        div.parentElement.classList.remove('main');
      }
    }

    function changeSrc(div){
      

      if(div.parentElement.classList.contains('main')){
        toggleClasses(div)
      }
      else if(div.parentElement.classList.contains('fullScreenImg')){
        toggleClasses(div);
      }
      else if(div.parentElement.classList.contains('right')){
        let leftHand = imgDivs.shift();
        imgDivs.splice(imgDivs.length, 0, leftHand);
        assignLinks();
      }
      else if(div.parentElement.classList.contains('left')){
        let rightHand = imgDivs.pop();
        imgDivs.splice(0,0, rightHand);
        assignLinks();
      }
      else{
        return;
      }
    }

    function assignLinks(){
      let length = base.children.length;
      for(let i = 0; i < length; i++){
        if(imgDivs[i]){
          imgDivs[i].classList.remove('smooth');
          setTimeout(function(){
            while (base.children[i].firstChild) {
              base.children[i].firstChild.remove();
            }
             base.children[i].appendChild(imgDivs[i]);
          }, 250);

          setTimeout(function(){
            imgDivs[i].classList.add('smooth');
          }, 350);

          setTimeout(function(){
            document.querySelectorAll('video').forEach((item, i) => {
              if(item.parentElement.classList.contains('main')){
                item.controls = true;
              }else{
                item.controls = false;
              }
            });
          }, 360);
        }
      }
    }

  };
}
/**
  * Client facing event delegation
  * @namespace clientEventDelegation
  */

/**
  * Modal Methods
  * @namespace modalMethods
  * @memberof clientEventDelegation
  * @description
    The functions which control the modal's behaviour: display and adding the
    current modal state to window.history
  */

document.addEventListener("DOMContentLoaded", function(event) {
  swiftmoAlert.set();

  clearTrailingSlash();
  cart.fetchCartData();
  changeEvents();
  clickEvents();

  //setStateFromPath(window.location.pathname);
  //setBySessionStore();

  initMap();

  if(document.querySelector('.folder')){
    folder2.reset().reattachEvents().foldercontinue();
  }

  if(window.location.pathname.includes('/blog')){
    eventOnAll('.topics', ()=> activateDropDown.setState('topicsfilter').hideOrDisplay());
  }

  if(window.location.pathname.includes('/shop/shapes')){
    let shapes = Array.from(document.querySelectorAll('.fetchItemTypes'));
    preLoadItems(shapes, '/stockByItemType');
  }

  if(window.location.pathname.includes('/shop/themes')){
    let themes = Array.from(document.querySelectorAll('.fetch'));
    preLoadItems(themes, '/stockQuery');
  }

  if(window.location.pathname.includes('/checkout')){

  }

  //if(window.location.pathname === '/shop' || window.location.pathname === '/shop/' ){
  if(window.location.pathname.includes('/shop')){

    if(document.getElementsByClassName('addToCartBtn').length !== 0){
      document.getElementsByClassName('addToCartBtn')[0].addEventListener('click', function(){
        this.parentElement.querySelector('.yestick').classList.add('paynowAnimate');
      });
    }
    shopEvents();
  }

  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });

  let t = document.querySelector('.menuTablet');
  let sticky = t.offsetTop;

  window.onscroll = function() {scrollAction()};

  function scrollAction() {
    if (window.pageYOffset > sticky) {
      t.classList.add("sticky");
      document.querySelector('.guttersBody').classList.add("gutterMargin");
    }
    else if(window.pageYOffset < sticky) {
      t.classList.remove("sticky");
      document.querySelector('.guttersBody').classList.remove("gutterMargin");
    }
    else{
      t.classList.remove("sticky");
      document.querySelector('.guttersBody').classList.remove("gutterMargin");
    }
  }

  if(window.pageYOffset === 0){
    t.classList.remove("sticky");
    //document.querySelector('.guttersBody').style.marginTop = '0em';
  }

});

function initMap(){
  if(window.location.pathname === '/visit'){
    window.setTimeout(function(){
      let lat = document.querySelector('.map').dataset.lat;
      let lng = document.querySelector('.map').dataset.lng;
      let map = new MapFunctions('.map', [lat, lng]);
      map.init();
      map.invalidateSize();
      map.addMarker(lat, lng);
    }, 500);
  }else{
    return;
  }
};

function backArrow(){
  if(window.location.pathname && window.location.pathname.includes('/shop')){
    document.querySelector('.arrowBack').classList.remove('hideInSight');
  }
  else{
    document.querySelector('.arrowBack').classList.add('hideInSight');
  }
}

function clearTrailingSlash(){
  let path = window.location.pathname;
  if(path.length > 1 && path.slice(path.length -1, path.length) === '/'){
    window.location.pathname = path.substring(0, path.length -1);
  }else{
    return;
  }
}

function url(){
  let bits = window.location.pathname.split('/');
  let url = window.location.pathname.replace(bits[bits.length-1], '');
  if(url.slice(url.length -1, url.length) === '/'){
    return url.substring(0, url.length -1);
  }else{
    return url;
  }
}

function preLoadItems(items, route){
  
  
  for (let i = 0; i < items.length; i++) {
    if(items[i].dataset.fetchthis.match(/'/g)) {
      items[i].dataset.fetchthis.replace("'", "\'");
    }

    let targetPage = document.querySelector('[data-name="'+ items[i].dataset.fetchthis+'"]' );
    if(targetPage.innerHTML.length < 5){
      xhr({ [items[i].dataset.fetchwhat] : items[i].dataset.fetchthis}, route, function(res){
        targetPage.innerHTML = res;
        let url = new URL(window.location.href + '/' + items[i].dataset.fetchthis.replace(/ /gi, '_'));

        if(i === items.length -1){
          attachCloseEvents();
          openModalViaPath();
        }

      });
    }
  }
}

function openModalViaPath(){
  let path = window.location.pathname.split('/'),
      page = document.querySelector('.focus').dataset.address;

  if(path[4]){
    item = (path.includes('shapes')) ? path[3].replace(/_/g, ' ') : path[4].replace(/_/g, ' '),
    theme = (path.includes('shapes')) ? path[4].replace(/_/g, ' ') : path[3].replace(/_/g, ' '),
    target = document.querySelector('.itemModal[data-item="' + escapeQuotes(item) +'"][ data-theme="' + escapeQuotes(theme) +'"]');
    
    openModalSetState(page, target, path[4]);
    
  }
};

function fetchItem(target, route){
  
  if(document.querySelector('[data-name="'+ target.dataset.fetchthis+'"]' ).innerHTML.length < 10){
    xhr({ [target.dataset.fetchwhat] : target.dataset.fetchthis}, route, function(res){
      let targetPage = document.querySelector('[data-name="'+ target.dataset.fetchthis+'"]' );
          targetPage.innerHTML = res;
      let url = new URL(window.location.href + '/' + target.dataset.fetchthis.replace(/ /gi, '_'));
          attachCloseEvents();
    });
  }
}

function clickEvents() {
  document.addEventListener('click', function(e){
    backArrow();

    if(e.target.classList.contains('printBtn')){
      window.print();
    }

    if(e.target.classList.contains('arrowBack')){
      
      let ar = window.history.state.page.split('|');
      let n = ar.slice().slice(0,-1);
      n[n.length-1] = parseInt(n[n.length-1])-1;
      let target = n.join('|');
      let url = window.location.href.split('/').slice(0,-1).join('/');

      if(parseInt(window.history.state.page) === 0){
        window.location = window.location.origin;
        openModalViaPath();
      }else{
        if(window.history.state.theme && !window.history.state.item){
          folder2.shortcutnextpage(target);
          updateState('shop', target, null, null, null, url);
        }
        else if(window.history.state.theme === null && window.history.state.item === null){
          let url = window.location.href.split('/').slice(0,-1).join('/');
          folder2.shortcutnextpage('0');
          updateState('shop', '0', null, null, null, url);
        }
        else{
          window.history.back();
          window.onpopstate = function(e){
            folder2.shortcutnextpage(window.history.state.page);
            openModalViaPath();
          }
        }
      }
    }

    if(e.target.classList.contains('toCheckoutBtn')){
      let cartcode = document.querySelector('#cartcode').dataset.cartcode;
      if(!sessionStorage.shippingDestination){
        swiftmoAlert.setContent(
          `Please choose a country for us to provide shipping prices. Or select
          the first option "pick up in store" if you will collect your order in
          person.`).toggle();
          return;
      }
      else{
        window.location.href = '/checkout'
      }
    }

    if(e.target.classList.contains('fetch')){
      fetchItem(e.target, '/stockQuery');
    }

    if(e.target.classList.contains('fetchItemTypes')){
      
      fetchItem(e.target, '/stockByItemType');
    }

    if(e.target.classList.contains('fetchItemGroup')){
      fetchItem(e.target, '/stockByItemGroup');
    }

    if(e.target.id === 'browseSpecial'){
      xhr({}, '/stockSpecial', function(res){
          let targetPage = document.querySelector('[data-name="special"]' );
              targetPage.innerHTML = res;
          let url = new URL(window.location.href + '/' + e.target.dataset.fetchthis.replace(/ /gi, '_'));
          attachCloseEvents();
      });
    }

    if(e.target.classList.contains('fetchPost')){
      if(document.querySelector('[data-name="'+ e.target.dataset.fetchthis+'"]' ).innerHTML.length < 10){
        //Looks like {"theme": "Rambling Rose"} for example, coult fetch {"special": "true"}
        xhr({ [e.target.dataset.fetchwhat] : e.target.dataset.fetchthis}, '/postQuery', function(res){
            let targetPage = document.querySelector('[data-name="'+ e.target.dataset.fetchthis+'"]' );
                targetPage.innerHTML = res;
                //window.history.state.page = targetPage.dataset.address
            let url = new URL(window.location.href + '/' + e.target.dataset.fetchthis.replace(/ /gi, '_'));

        });
      }
    }

    if(e.target.classList.contains('toggleByThemeModal')){
      openModalSetState(window.history.state.page, e.target.nextSibling, e.target.nextSibling.dataset.theme.replace(/ /g, '_'));
    }

    if(e.target.classList.contains('toggleModal') && !e.target.classList.contains('shoppingCart')){
      openModalSetState(window.history.state.page, e.target.nextSibling, e.target.nextSibling.dataset.item.replace(/ /g, '_'));
    }

    if(e.target.classList.contains('question')){
      if(e.target.nextSibling.classList.contains('infodisplay')){
        e.target.nextSibling.classList.remove('infodisplay');
      }else{
        e.target.nextSibling.classList.add('infodisplay');
      }
      e.target.nextSibling.querySelector('.circle').addEventListener('click', function(el){
        e.target.nextSibling.classList.remove('infodisplay');
      });
    }else{
      document.querySelectorAll('.infodisplay').forEach(function(el, i){
        el.classList.remove('infodisplay');
      });
    }

    if(e.target.classList.contains('toggleinvoiceaddress')){
      e.preventDefault();
      if(e.target.parentElement.nextSibling.classList.contains('hide')){
        e.target.parentElement.nextSibling.classList.remove('hide');
        document.querySelector('#clientinvoicename').focus();
        document.querySelector('#clientinvoicename').parentElement.scrollIntoView();
      }else{
        e.target.parentElement.nextSibling.classList.add('hide');
        document.querySelector('#savedetails').focus();
        document.querySelector('#savedetails').parentElement.scrollIntoView();
      }
    }

    if(e.target.classList.contains('toggleFetchByConfcode')){
      e.preventDefault();
      if(document.querySelector('#clientCodeInput').classList.contains('hide')){
        document.querySelector('#clientCodeInput').classList.remove('hide');
        document.querySelector('#clientcode').focus();
        document.querySelector('#clientCodeInput').scrollIntoView();
        document.querySelector('#clientcode').addEventListener('input', fetchClientDetails);
      }else{
        document.querySelector('#clientCodeInput').classList.add('hide');
        document.querySelector('#countrycode').focus();
        document.querySelector('#countrycode').parentElement.scrollIntoView();
      }
    }
    if(e.target.classList.contains('toPaymentBtn')){
      e.preventDefault();
      makeCustomerForm();
    }
    //
  });
}

function fetchClientDetails(e) {
  if(e.target.value.length === 8){
    let email = document.querySelector('#clientemail').value;
    xhr({ clientcode : e.target.value, email: email}, '/registerClient', function(res){
      let parsed = JSON.parse(res);
      let keys = Object.keys(parsed);

      for (let i = 0; i < keys.length; i++) {
          let val = parsed[keys[i]];
          let t = document.querySelector('[name="'+keys[i]+'"]');

        if(i === keys.length-1){
          let parent = document.querySelector('.payment-form');
          initStripeCartCode(parent, null);
          folder2.shortcut('1');
          document.querySelector('.payment-form').scrollIntoView();
        }

        else if(keys[i] === '_id' || keys[i] === 'clientcode' ){
          continue;
        }

        else if(t.type === 'checkbox'){
          t.setAttribute('checked', 'checked');
        }

        else if(t.type === 'text'){
          t.value = val;
        }

        else if(t.tagName === 'SELECT'){
          setOption(t, val);
        }


      }
    });

  }
}

function setOption(t, val){
  for(let i = 0, j = t.options.length; i < j; ++i) {
    if(t.options[i].value === val) {
       t.selectedIndex = i;
       break;
    }
  }
}

function makeCustomerForm(){
  let form = $('#clientDetails').querySelector('form')
  let requiredFields = ['#clientemail', '#countrycode', '#clientphonenumber',
  '#clientname', '#clientaddressline1', '#addresscity', '.country', '#addresspostcode'];

  //Check
  for (var i = 0; i < requiredFields.length; i++) {
    if($(requiredFields[i]).value === ''){
      $(requiredFields[i]).classList.add('attentionBorder');
      swiftmoAlert.setContent(`We require you to fillout ${requiredFields[i]} details`).toggle();
      $(requiredFields[i]).scrollIntoView();
    }
    else{
      $(requiredFields[i]).classList.remove('attentionBorder');
    };
    //Event
    $(requiredFields[i]).addEventListener('input', function(e){
      $(requiredFields[i]).classList.remove('attentionBorder');
    });
  }

  formxhr(new FormData(form), "/registerClient", function(res){
    let parent = $('.payment-form');
    initStripeCartCode(parent, null);
    folder2.shortcut('1');
    parent.scrollIntoView({block: 'end', behavior: 'smooth', inline: 'center'});
  });
}

function addScroller(targetDiv){
  var images = new MakeScroller2();
  //
  if(targetDiv && targetDiv.firstChild === null){
    images.build(targetDiv, JSON.parse(targetDiv.dataset.imagelinks));
  }

  if(!document.querySelector('.basedimensions .left').innerHTML){

  }
}

function openModal(page, targetModal, themeOrItem){
  
  targetModal.style.display = 'block';
  addScroller(targetModal.querySelector('.scroller'));

  if(targetModal.querySelector('.plus').classList.contains('hasEvent') === false){

    targetModal.querySelector('.plus').classList.add('hasEvent');
    targetModal.querySelector('.plus').addEventListener('click', plus);

    function plus(){
      let number = targetModal.querySelector('.plus').previousSibling.firstChild,
      max = parseInt(number.dataset.max),
      val = parseInt(number.textContent);

      if(val < max){
        number.textContent = val + 1;
      }
      if(val >= max){
        swiftmoAlert.setContent('We don\'t have your desired quantity in stock by the looks, please drop us an e-mail with your request.').toggle();
      }
    }

  }

  targetModal.querySelector('.minus').addEventListener('click', function(){
    let number = targetModal.querySelector('.plus').previousSibling.firstChild,
    val = parseInt(number.textContent);

    if(val > 0){
      number.textContent = val - 1;
    }
  });

  //document.body.style.overflow = 'hidden';
  document.body.style.overflow = 'scroll';
}


/**
  * openModalSetState
  * @function openModalSetState
  * @param {string} string representation of the indexes leading to the current
    page in the folder, e.g. "1|0|1|0" that is stored on the target page as a
    data attribute "address"
  * @description
    The openModalSetState both opens a modal and makes a modal state navigable
     via the history API. Regarding parameters set via the history API see:
       //https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
  * @memberof clientEventDelegation.modalMethods
  */
function openModalSetState(page, targetModal, themeOrItem){
  
  openModal(page, targetModal, themeOrItem);
  let len = window.location.pathname.split('/').length;
      //add = (len < 5) ? window.location.pathname + '/' +  targetModal.dataset.theme.replace(/ /g, '_') + '/' +  targetModal.dataset.item.replace(/ /g, '_')  : window.location.pathname;

  function name(){
    let path = window.location.pathname.split('/');
    let add;

    if(path.includes('types')){
      add = (len < 5) ? window.location.pathname + '/' +  targetModal.dataset.theme.replace(/ /g, '_') + '/' +  targetModal.dataset.item.replace(/ /g, '_')  : window.location.pathname;
    }
    else{
      add = (len < 5) ? window.location.pathname + '/' +  themeOrItem.replace(/ /g, '_') : window.location.pathname;
    }

    return add;
  }

  setStateFromPath(name());
}

/**
  * attachCloseEvents
  * @function attachCloseEvents
  * @description
    Attaches close event to each ".itemModal" in the DOM which closes the current
    modal and goes back one step in the history.
  * @fires toggle.tog(event, 'none')
  * @fires window.history.back();
  * @memberof clientEventDelegation.modalMethods
  */
function attachCloseEvents(){
  document.querySelectorAll('.itemModal').forEach((e)=>{
    toggle.setinst(e);
    attachClose.attach(e.querySelectorAll('.circleClose'));
  });
  document.addEventListener('click', (e)=>{
    if(e.target.classList.contains('question')){
      e.target.nextSibling.classList.add('infodisplay');
      e.target.nextSibling.querySelector('.circle').addEventListener('click', (el)=>{
        e.target.nextSibling.classList.remove('infodisplay');
      })
    }
  });

}

const attachClose = {
  eventsAttached: [],
  attach: function(targets){
    targets.forEach(function(item, i){
      if(!attachClose.eventsAttached.includes(item)){
        attachClose.eventsAttached.push(item)
        item.addEventListener('click', attachClose.close);
      }
    });
  },
  close: function(e){
    document.querySelector('body').style.position = 'unset';
    toggle.tog(e.target.closest('.itemModal'), 'none');
    document.body.style.overflow = 'scroll';
    let p = window.location.pathname.split('/');
    if(p.length === 5 && p.includes('shop')){
      p.pop();
      let path = p.join('/');
      setStateFromPath(path);
    }
  }
}
function MapFunctions(baseelem, coordinates){
  let displayed = false;
  let map;

  this.init = init;
  this.invalidateSize = invalidate;
  this.addMarker = addMarker;

  function init(){
    if(displayed === false){
      let mapdiv = document.createElement('div');
      document.querySelector(baseelem).appendChild(mapdiv);

      map = L.map(mapdiv, { layers: [
        L.tileLayer('https://tile.openstreetmap.org/${z}/${x}/${y}.png	', {
          attribution: "<a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
        })],
        preferCanvas: true,
        center: coordinates,
        zoom: 11
      });
      L.control.scale().addTo(map).setPosition('bottomright');
    }

    displayed = true;
    return this;
  };

  function invalidate(){
    return map.invalidateSize();
  };

  function addMarker(lat, lng){
    let marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup('Coordinates: ' + lat + ',' + lng).openPopup();
    map.setView([lat, lng], 11);
  };

}
document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('question')){
    e.target.nextSibling.classList.add('infodisplay');
    e.target.nextSibling.querySelector('.circle').addEventListener('click', (el)=>{
      e.target.nextSibling.classList.remove('infodisplay');
    })
  }
});
//mobile menu, does it exist? Do stuff.
//window.onresize = nav();

window.onload = nav();

function formatDate(d){
  let date = new Date(d);
  let formated = date.getFullYear() + '-' +
  (date.getMonth() + 1) + '-' +
  date.getDate();
  return formated;
}

function eventOnAll(classstring, event){
  let targetclass = document.querySelectorAll(classstring);
  for(let i = 0; i < targetclass.length; i++){
    targetclass[i].addEventListener('change', (e)=>{
     event(e, i);
    });
  }
}

function escapeQuotes(text){
  return text.replace("'", "\'");
  //.replace('"', '\\"').replace("'", "\\'").replace('`', '\\`');
}

function any(testsubjects, keyvalue){
  return testsubjects.includes(keyvalue);
};

function setOption(select, val){
  select.querySelectorAll('option').forEach((item, i) => {
    if(item.textContent === val){
      item.setAttribute('selected', 'selected');
    }
  });
}

/**
  * Got tired of writing "document.querySelector('')"
  * @function $
  * @param {string} CSS querySelector
  * @description "document.querySelector('')" looked messy in some code.
  * @todo Could pass n element to chain them, but don't tink I'll bother.
  */
function $(e){
  return document.querySelector(e);
};

function nav(){

  if(document.querySelector('.navColapseBtn')){
    document.querySelector('.navColapseBtn').classList.add('scaled');
    document.querySelector('.navColapseBtn').addEventListener('click', function(e){
      let t = document.querySelector('.navColapseDiv');
      if(t.classList.contains('shownav')){
        t.classList.remove('shownav');
        document.body.style.overflow = 'scroll';
        e.target.classList.remove('navColapseBtnX');
      }else{
        t.classList.add('shownav');
        document.body.style.overflow = 'hidden';
        e.target.classList.add('navColapseBtnX');
      }
    });
  }
}

function selectElementContents(el) {
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// Resize reCAPTCHA to fit width of container
// Since it has a fixed width, we're scaling
// using CSS3 transforms
// ------------------------------------------
// captchaScale = containerWidth / elementWidth

function scaleCaptcha(elementWidth) {
  // Width of the reCAPTCHA element, in pixels
  var reCaptchaWidth = 304;
  // Get the containing element's width
	var containerWidth = document.querySelector('#inPageRecaptcha').width();
  // Only scale the reCAPTCHA if it won't fit
  // inside the container
  if(reCaptchaWidth > containerWidth) {
    // Calculate the scale
    var captchaScale = containerWidth / reCaptchaWidth;
    // Apply the transformation
    document.querySelectorALL('.g-recaptcha').forEach(function(e){
      e.style.transform = 'scale('+captchaScale+')';
    });
  }
}

//clearchildren
function clearchildren(elem){
  var target = document.querySelector(elem);
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
}

var swiftmoAlert = {
  set : function(){
    toggle.setinst('.alertmodal');
    document.querySelector('.circleClose').addEventListener('click', function(e){
      toggle.tog('.alertmodal', 'none');
      e.stopPropagation();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.code === 'Space' && document.querySelector('.alertmodal').style.display === 'block'){
        toggle.tog('.alertmodal', 'none');
        e.stopPropagation();
      }
    });
    return this;
  },
  toggle : function(){
    toggle.tog('.alertmodal');
    return this;
  },
  setContent : function(content){
    document.querySelector('.alertmodalcontentP').textContent = content;
    return this;
  },
  /** Takes an object: {iftrue: callbackFntrue, iffalse: callbackFnfalse}
    * with a function to call if confirmed and another if not.
    */
  confirm : function(iftruefalse){
    var btn = document.createElement('button');
        btn.textContent = 'confirm';
    var btn1 = document.createElement('button');
        btn1.textContent = 'cancel';
    document.querySelector('.alertmodalcontentP').append(btn);
    document.querySelector('.alertmodalcontentP').append(btn1);
        btn.addEventListener('click', function(){
          swiftmoAlert.toggle();
          iftruefalse.iftrue();
        });
        btn1.addEventListener('click', function(){
          swiftmoAlert.toggle();
          iftruefalse.iffalse();
        });

    return this;
  },
  /*TODo*/
  swiftMoAffirm : function(){
    //document.querySelector('.alertmodalcontentP')
    //domadd.append('button', 'yes', '#');
  }
};


function SwiftmoAlert(){
  var instance = new toggle();
  var p;
  var count = 1;
  this.test = function(){
    alert('spin');
  };

  this.clear = function(targetElement){
    clearchildren(targetElement);
    return this;
  };

  this.targetAndDeploy = function(targetElement){
    instance.setinst(targetElement);
    p = document.createElement('p');
    p.classList.add('alertdiv');
    document.querySelector(targetElement).appendChild(p);
    document.querySelector(targetElement).style.display = 'none';
    return this;
  };

  this.message = function(message){
    p.textContent = message;
    return this;
  };

  this.toggle = function(targetElement){
    count++;
    
    if(count % 2 === 0){
      
      instance.tog(targetElement, 'block');
      document.querySelector(targetElement).scrollIntoView({block: 'start',  behavior: 'smooth' });
      window.setTimeout( function(){document.querySelector(targetElement).classList.add('bounce', 'bounce-4');}, 500);
    }
    else{
      
      instance.tog(targetElement, 'none');
    }
    return this;
  };
}

(function scopeItIn() {
	var instances = [];
	var states = [];
	//div is target, type is style, e.g. flex or block
	return toggle = {
		tog: function(div, type) {
			if (typeof div === 'string') {
				if (states[instances.indexOf(div)] % 2 ) {
					
					if (!type) {
						document.querySelector(div).style.display = 'block';
					} else {
						document.querySelector(div).style.display = type;
					}
				} else {
					document.querySelector(div).style.display = 'none';
				}
			} else if (typeof div === 'object') {
				if (states[instances.indexOf(div)] % 2) {
					
					if (!type) {
						div.style.display = 'block';
					} else {
						div.style.display = type;
					}
				} else {
					div.style.display = 'none';
				}
			}
			states[instances.indexOf(div)]++;
			return this;
		},
		setinst: function(div) {
			if (instances.includes(div) === false) {
				instances.push(div);
				states.push(1);
				return this;
			} else {
				return this;
			}
		}
	};
})();
/*jshint esversion: 6 */
window.addEventListener('DOMContentLoaded', ()=>{
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js', { scope: "/" })
      .then(() => {

      })
      .catch((err)=>{
        console.warn(err);
      });
  }
});

// Test this by running the code snippet below and then
// use the "Offline" checkbox in DevTools Network panel
//window.addEventListener('online', handleConnection);
//window.addEventListener('offline', handleConnection);


function sendMessage(message) {
  // This wraps the message posting/response in a promise, which will resolve if the response doesn't
  // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
  // a convenient wrapper.
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    // This sends the message data as well as transferring messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply via postMessage(), which
    // will in turn trigger the onmessage handler on messageChannel.port1.
    // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    navigator.serviceWorker.controller.postMessage(message,
      [messageChannel.port2]);
  });
}
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
/**
  * @param cartcode takes a cartcode string linked to a particular session
  * @param {string} targetElement Takes a querySelector string
  */
function initStripeCartCode(parent, thenDo){

  let stripe = Stripe('stripeTokenPublic'),
      elements = stripe.elements(),
      card = elements.create('card');

  // Add an instance of the card UI component into the `card-element` <div>
  card.mount(parent.querySelector('.card-element'));

  card.addEventListener('change', function(event) {
    var displayError = parent.querySelector('.card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

  function stripeTokenHandler(token) {
    // Insert the token ID into the form so it gets submitted to the server
    const formData = new FormData(parent);
    formData.append('stripeTokenSCA', token.paymentMethod.id);

    //self instantiates:
    (function sendForm(){
      formxhr(formData, '/globalPayment', function(callback){
        var cb = JSON.parse(callback);
        if(cb.error){
          parent.querySelector('.card-errors').textContent = cb.error;
        }
        else if(cb.requires_action === true){
          handleAction(cb);
        }
        else{
          parent.querySelector('.paynowNew').classList.add('paynowAnimate');
          parent.querySelector('.card-errors').textContent = 'Payment successful';
          parent.querySelector('.card-errors').classList.add('green');

          xhr({cartcode: cart.returnCartCode()}, '/checkorder', function(callback){
            document.querySelector('#orderConfirmation').innerHTML = callback;

              folder2.shortcut('2');
            //if(thenDo){
            //thenDo clears sales objects
              //thenDo();
              resetHtmlEl();
            //}
          });
        }
      });
      return false;
    } )();
  }

  function resetHtmlEl(){
    parent.querySelector('.card-errors').textContent = 'Payment successful';
    parent.querySelector('.card-errors').classList.remove('green');
    parent.querySelector('.paymentBtn').disabled = false;
  }

  //Write another function which sends the payment intent confirming the payment.
  //Then does the normal success thing as above.

  function handleAction(response) {


    stripe.handleCardAction(response.payment_intent_client_secret).then(
      function(result) {
        if (result.error) {
          // Inform the user if there was an error
          var errorElement = parent.querySelector('.card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // Send the token to your server
          result.cartcode = response.cartcode;

          //stripeTokenHandler(result);
          confirmIntent(result);
        }
      });
  }

  function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  function confirmIntent(intent){
    xhr(intent, '/confirmPaymentIntent', function(callback){

      if(IsJsonString(callback)){
        var cb = JSON.parse(callback);
        if(cb.error){
          parent.querySelector('.card-errors').textContent = cb.error;
        }
        if(cb.requires_action === true){

          handleAction(cb);
        }
      }
      else{
        parent.querySelector('.paynowNew').classList.add('paynowAnimate');
        parent.querySelector('.card-errors').textContent = 'Payment successful';
        parent.querySelector('.card-errors').classList.add('green');
      //  document.querySelector('.orderConfirmation').innerHTML = callback;
      }
    });
  }

  function createToken() {

    parent.querySelector('.paymentBtn').disabled = true;
    /*
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Inform the user if there was an error
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server
        stripeTokenHandler(result.token);
      }
    });*/

    stripe.createPaymentMethod('card', card).then(function(result){

      if (result.error) {

        // Inform the user if there was an error
        parent.querySelector('.card-errors').textContent = result.error.message;
      } else {

        // Send the token to your server
        stripeTokenHandler(result);
      }
    });



  }

  parent.addEventListener('submit', function(e) {
    e.preventDefault();

    createToken();
  });
}
function offlineWarn(){
  if(window.navigator.onLine){
    document.querySelector('.offline').style.display = 'none';
  }
  else{
    document.querySelector('.offline').style.display = 'block';
  }
}

function xhr(items, route, callback){
  offlineWarn();
  afirm = false;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', route);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(items));

    if(xhr.readyState === 1){
      document.body.style.pointerEvents = 'none';
    }
    if(!window.navigator.onLine){
      document.body.style.pointerEvents = '';
    }
    /*
    window.setTimeout(function(){
      if(xhr.readyState === 1){
        document.querySelector('.loadingGif').style.display = 'block';
      }
    }, 1000);*/
    xhr.onreadystatechange = function () {
      if(xhr.readyState === 4 && xhr.status === 200) {
        if(xhr.responseText){
          callback(xhr.responseText);
          document.body.style.pointerEvents = '';
          //document.querySelector('.loadingGif').style.display = 'none';
        }
      }
    };

}

function xhrget(items, route, callback){
  offlineWarn();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', route);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.timeout = 1000;
  xhr.send(encodeURI(items));
  xhr.ontimeout = function(e){
    callback('404');
  };
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr.responseText);
    }
    if(xhr.status === 404) {
      callback('404');
    }
  };
}

function formxhr(items, route, callback){
  offlineWarn();
  var xhr = new XMLHttpRequest();
  xhr.open('POST', route);
  //xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //xhr.setRequestHeader('Content-Type','multipart/form-data');
  xhr.send(items);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr.responseText);
    }
    if(xhr.readyState === 4 && xhr.status === 500){
      //
      //n.b. make errors useful, this is actual error text:
      callback(xhr.responseText);
    }
  };

}

function asyncXHR(route, payload, noparse){
  offlineWarn();
	return new Promise(resolve => {
		xhr(payload, route, function callback(reply){
      if(noparse === "noparse"){
        resolve(reply);
      }
      else{
        var parsed = JSON.parse(reply);
        resolve(parsed);
      }
		});
	});
}
