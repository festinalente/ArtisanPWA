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

  if(window.location.pathname.includes('/shop/themes')){
    attachCloseEvents();
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
