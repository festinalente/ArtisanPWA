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
