/**
  * @param {string} parent -Takes a query selector string e.g. '.imagescroller' unique to the div you want  to display the scroller
  * @param {array} imageLinks -Takes an array of links (try it with locally hosted images on codepen)
  * @description A simple image scroller that can be called up in a one liner. The CSS is all nested in the imagescroller class to avoid
  poluting the name space. Changed to a constructor in April 2020
  */

  /*
    var patterns = new MakeScroller();
      patterns.build('.patternscroller', [
        '/images/bbdesign_slider/artichoke.jpg',
        '/images/bbdesign_slider/primavera.jpg',
        '/images/bbdesign_slider/lilyflower.jpg'
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
