  /**
  * Attach Image Load Event
  * @namespace imagesAPI
  * @description A group of functions to deal with image uploads. It could be
   modularized.
  */

/**
  * Attach Image Load Event
  * @function attachImageLoadEvent
  * @param {HTMLelement} upload - Optional element to display the uploaded image.
  * @summary Attaches an upload event to all elements with ".imageInput" class
  * @memberof imagesAPI
  */

/**TODO separatefunction to handle diferent image types instead of putting everything through the same functions **/
function attachImageLoadEvent(clone){
  document.querySelectorAll('.imageInput').forEach((item, i) => {
    item.addEventListener('change', (e)=>{
      let displayImg = e.target.parentElement.querySelector('.displayImage');
      let reader = new FileReader();
      let file = e.target.files[0];

      if(file){
        reader.readAsDataURL(file);
      }

      reader.addEventListener('load', ()=>{
        symlink = reader.result;

        if(displayImg.children[0]){
          displayImg.removeChild(displayImg.children[0]);
        }
        if(!displayImg.children[0]){
          let img = document.createElement('img');
          img.setAttribute('src', symlink);
          displayImg.appendChild(img);
          let imagediv = (clone) ? clone : e.target.closest('.distinctImage');
          addImageEvent();
          saveImage(imagediv, item);
        }
      });
    });
  });
}

let imageEventTracker = [];
function addImageEvent(){
  let imgDivs = document.querySelectorAll('.distinctImage');
  for (let i = 0; i < imgDivs.length; i++) {
    if(imgDivs[i].querySelector('.addimage') && !imageEventTracker.includes(imgDivs[i].querySelector('.addimage'))){
      imgDivs[i].querySelector('.addimage').addEventListener('click', (e)=>{
        makeAddImage(e.target.parentElement, 'new image label', '');
      });
      imageEventTracker.push(imgDivs[i].querySelector('.addimage'));
    }
  }
}

function saveImage(imagediv, item){

  if(imagediv.dataset.type === 'stock'){
    saveNewItem(imagediv, item);
  }
  else if(imagediv.dataset.type === 'theme'){
    themeImage(imagediv, item);
  }
  else if(imagediv.dataset.type === 'producer'){
    producerImage(imagediv, item)
  }
  else if(imagediv.dataset.type === 'placeholderimage'){
    placeholderimage(imagediv, item)
  }
  else{

    itemtypeAlter(imagediv, item);
  }
}

function saveOnAddName(imagediv, item){


  let savebtn = document.createElement('button');
      savebtn.classList.add('btngreen', 'sms2', 'bounceOnHover', 'block');
      savebtn.textContent = 'Save Image';
      savebtn.style.margin = '1em';
      savebtn.addEventListener('click', (e)=>{
        if(imagediv.dataset.type === 'stock'){
          saveNewItem(imagediv, item);
        }
        else{
          itemtypeAlter(imagediv, item);
        }
      });


  let referenceNode = imagediv.querySelector('.imagetype');
      referenceNode.parentNode.insertBefore(savebtn, referenceNode.nextSibling);

}

function saveNewItem(imagediv, item){
  if(imagediv.querySelector('.imagetype').value === ''){
    //saveOnAddName(imagediv, item);
    //swiftmoAlert.setContent('Remember to label this image, it won\'t save without a name. Click the save image button once it\'s named').toggle();
    //return;
    imagediv.querySelector('.imagetype').value = 'no label given';
  }

  let type = imagediv.dataset.type,
      time = new Date(),
      mill = time.getTime(),

      imgdata = {
        itemref: imagediv.dataset.itemref,
        altered: mill,
        //imgtype: imagediv.querySelector('.imagetype').value,
        itemtype: 'stock',
        photoLabel: imagediv.querySelector('.imagetype').value,
        image: item.files[0],
        theme: document.querySelector('#select-theme').value,
        'item type': document.querySelector('#select-item_type').value,
        producer: document.querySelector('#select-producer').value,
        tax: document.querySelector('.tax').value,
        price: document.querySelector('.price').value,
        special: document.querySelector('.special').checked,
      };

  sendImage(imgdata,'/backend/saveitem', function(callback){
    swiftmoAlert.setContent(type + ' image saved').toggle();

    imagediv.querySelector('.deleteImage').addEventListener('click', function(e){
      xhr({link: JSON.parse(callback).link}, '/backend/deleteImage', function(){

        let child = imagediv.querySelector('.lazyImage').firstChild;
        imagediv.querySelector('.lazyImage').removeChild(child);
      });
    });

  });
}

function itemtypeAlter(imagediv, item){


  if(imagediv.querySelector('.imagetype') && imagediv.querySelector('.imagetype').value === ''){
    saveOnAddName(imagediv, item);
    swiftmoAlert.setContent('Remember to label this image, it won\'t save without a name. Click the save image button once it\'s named').toggle();
    return;
  }

  let time = new Date(),
      mill = time.getTime(),
      type = imagediv.dataset.type,
      themename = document.querySelector('#theme').textContent,

      imgdata = {
        itemref: imagediv.dataset.itemref,
        //themename: themename,
        theme: themename,
        timestamp: mill,
        photoLabel: imagediv.querySelector('.imagetype').value,
        //imgtype: imagediv.querySelector('.imagetype').value,
        'item type': type,
        image: item.files[0]
      };

  sendImage(imgdata,'/backend/saveitem',  function(cb){
    swiftmoAlert.setContent(type + ' image saved').toggle();
  });
}

function placeholderimage(imagediv, item){
  let time = new Date(),
      mill = time.getTime(),
      placeholder = imagediv.dataset.value,
      imgdata = {
        timestamp: mill,
        photoLabel: imagediv.dataset.value,
        image: item.files[0]
      };

  sendImage(imgdata,'/backend/saveplaceholder',  function(cb){
    swiftmoAlert.setContent(imagediv.dataset.value + ' image saved').toggle();
  });
}

function themeImage(imagediv, item){
  if(imagediv.querySelector('.imagetype').value === ''){
    saveOnAddName(imagediv, item);
    swiftmoAlert.setContent('Remember to label this image, it won\'t save without a name. Click the save image button once it\'s named').toggle();
    return;
  }

  let imgdata = {
      photoLabel: imagediv.querySelector('.imagetype').value,
      themename: document.querySelector('#theme').textContent,
      image: item.files[0]
    };

  sendImage(imgdata,'/backend/saveThemeImage',  function(cb){
    //write to element in case user want to delette it:

    imagediv.closest('.distinctImage').querySelector('img').src = JSON.parse(cb).link
    gthing = imagediv.closest('.distinctImage').querySelector('img')
    swiftmoAlert.setContent('theme image saved').toggle();
  });
}

function producerImage(imagediv, item){
  if(imagediv.querySelector('.imagetype').value === ''){
    saveOnAddName(imagediv, item);
    swiftmoAlert.setContent('Remember to label this image, it won\'t save without a name. Click the save image button once it\'s named').toggle();
    return;
  }

  let imgdata = {
      //producer's role or job:
      role: imagediv.closest('.editmodal').querySelector('.producerType').textContent,
      //label for photo:
      photoLabel: imagediv.querySelector('.imagetype').value,
      //producer name:
      name: document.querySelector('#producer').textContent ,
      image: item.files[0]
    };

  sendImage(imgdata,'/backend/saveProducerImage',  function(cb){
    swiftmoAlert.setContent('producer image saved').toggle();
  });
}

function sendImage(imgdata, route, callback2){
  let form = new FormData();
  let keys = Object.keys(imgdata);
  let values = Object.values(imgdata);

  keys.forEach(function(e, i){
    //append image last:
    if(e !== 'image'){
      form.append(keys[i], values[i]);
    }
    if(i === keys.length-1){
      form.append('image', values[keys.indexOf('image')]);
    }

  });
  formxhr(form, route, function callback(response){
    callback2(response);
  });
  return this;
}
