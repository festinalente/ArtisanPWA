
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
