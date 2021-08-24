//e.target is video element
function saveVideo(uploadElement){
  uploadElement.nextSibling.addEventListener('click', function(e){
    e.preventDefault();


    if(uploadElement.parentElement.parentElement.querySelector('.videolabel').value === ''){
      //saveOnAddName(imagediv, item);
      //swiftmoAlert.setContent('Remember to label this image, it won\'t save without a name. Click the save image button once it\'s named').toggle();
      //return;
      uploadElement.parentElement.parentElement.querySelector('.videolabel').value = 'no label given';
    }

    let time = new Date(),
        mill = time.getTime(),
        videodata = {
          timestamp: mill,
          itemtype: 'stock',
          label: uploadElement.parentElement.parentElement.querySelector('.videolabel').value,
          theme: document.querySelector('#select-theme').value,
          'item type': document.querySelector('#select-item_type').value,
          itemref: uploadElement.parentElement.dataset.itemref,
          video: uploadElement.files[0],
          producer: document.querySelector('#select-producer').value,
          tax: document.querySelector('.tax').value,
          price: document.querySelector('.price').value,
          special: document.querySelector('.special').checked,
        },
        form = new FormData(),
        keys = Object.keys(videodata),
        values = Object.values(videodata);

    keys.forEach(function(e, i){
      form.append(keys[i], values[i]);
    });

    formxhr(form, '/backend/saveitemvideo', function callback(response){
      let responseParsed = JSON.parse(response);

      if(responseParsed.error){
        swiftmoAlert.setContent(responseParsed.error).toggle();
      }
      else{
        let container = document.createElement('div');
            container.style.display = 'flex';
        let video = document.createElement('video');
            video.setAttribute('src', responseParsed.link);
            video.setAttribute('autoplay', true);
            video.style.maxWidth = '100%'

        container.appendChild(video);
        uploadElement.parentElement.parentElement.querySelector('.videoDisplay').appendChild(container);

        swiftmoAlert.setContent(responseParsed.message).toggle();
        video.scrollIntoView(true);
      }
    });
  });
}
