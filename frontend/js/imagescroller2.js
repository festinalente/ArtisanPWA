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
