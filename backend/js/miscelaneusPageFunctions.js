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

/**
  * Gets textContent or data value from from a dropdown select.
  * @function optData
  * @param {HTMLelement} select drop down element you want to get selection from.
  * @param {string} [data to return] a attribute you wish to fetch from said element.
  * @description If the second parameter is left out it returns the textContent,
    else it return the dataset value refering to the key passed.
  * @todo Could make return textContent too I guess ()
  */
function optData(select, val){
  
  if(select.selectedIndex && select.selectedIndex > 0){
    if(val){
      return select.options[select.selectedIndex].dataset[val];
    }
    else{
      return select.options[select.selectedIndex].textContent;
    }
  }else{
    return 'default';
  }
}

function setOption(select, val){
  select.querySelectorAll('option').forEach((item, i) => {
    if(item.textContent === val){
      item.setAttribute('selected', 'selected');
    }
  });
}

function getOptionByValue(select, val){
  let opts = select.querySelectorAll('option');
  for (var i = 0; i < opts.length; i++) {
    if(opts[i].textContent === val){
      return opts[i];
    }
  }
}

function randomBytes(length){
  let array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  let st = ''
  for (let i = 0; i < array.length; i++) {
    st += array[i]
    if(i === array.length-1){
      return st;
    }
  }
}

function characterCount(inputDiv, displayDiv, length){
  inputDiv.addEventListener('input', (e)=>{
    let len = length - e.target.textContent.length;
    displayDiv.textContent = len;
    if(len > length){
      displayDiv.classList.add('alertdiv');
    }else{
      if(displayDiv.classList.contains('alertdiv')){
        displayDiv.classList.remove('alertdiv');
      }
    }
  });
}

function addTabIndex(parent){
  let els = parent.querySelectorAll('.tabindex');
  if(els){
    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute('tabIndex', i.toString());
    }
  }
}

function nav(){
  if(document.querySelector('.navColapseBtn')){
    document.querySelector('.navColapseBtn').classList.add('scaled');

    document.querySelector('.navColapseBtn').addEventListener('click', function(e){
      let height = document.querySelector('.navColapseDiv').style.height;
      if(document.querySelector('.navColapseDiv').style.height === '100%'){
        e.target.classList.remove('navColapseBtnX');
        document.querySelector('.navColapseDiv').style.height = '0px';
      }else{
        e.target.classList.add('navColapseBtnX');
        document.querySelector('.navColapseDiv').style.height = '100%';
      }
    });
  }
}

function any(testsubjects, keyvalue){
  return testsubjects.includes(keyvalue);
};

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

/*
if(document.getElementsByClassName('addToCartBtn').length !== 0){
  document.getElementsByClassName('addToCartBtn')[0].addEventListener('click', function(){
    //this.parentElement.previousSibling.previousSibling.classList.add('paynowAnimate');
  });
}*/

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
