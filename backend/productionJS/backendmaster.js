

function makeAddBox(val, id, field, contentArray, target){
  
  let p = document.createElement('p');
      p.classList.add('flex');
  let s1 = document.createElement('span');
      s1.classList.add('fieldEditable');
      s1.textContent = val
  p.appendChild(s1);
  let s2 = document.createElement('span');
      s2.classList.add('flexrow');
      s2.dataset._id = id;
      s2.dataset.type = field;
      s2.dataset.values = contentArray;
  p.appendChild(s2);
  let s3 = document.createElement('span');
      s3.classList.add('remove', 'editContol');
      s3.setAttribute('title','remove this entry');
  s2.appendChild(s3);
  let s4 = document.createElement('span');
      s4.classList.add('edit', 'editContol');
      s4.setAttribute('title','edit this entry');
  s2.appendChild(s4);
  let s5 = document.createElement('span');
      s5.classList.add('save', 'editContol');
      s5.setAttribute('title','save this edit');
      s5.addEventListener('click', ()=>{
        saveFn(s5)
      });
  s2.appendChild(s5);
  //let t = document.querySelector('#list'+id);
  
    let t = document.querySelector(target);
      t.insertBefore(p, t.children[t.childElementCount-1]);
}

function whipe(){
  document.querySelector('.x').textContent = 0;
  document.querySelector('.y').textContent = 0;
  document.querySelector('.z').textContent = 1999;
  
    
  document.querySelector('.itemNewWeight').textContent = 0;
  
  document.querySelector('#item_type').textContent = "";

  document.querySelector('.nameedit').classList.remove('hide');
  document.querySelector('#editmodal-item_type').style.display = 'block';
}

function saveNewTheme(id, name){
  let saveob = {_id: id, theme: {name: name, 'image links': []}};
  xhr(saveob, '/backend/updateArrayItem', function(res){
    if(res === 'success'){
      alert('hurrah');
    }
  });
}

function saveFn(target){
  
  let value = target.parentElement.previousSibling.textContent;
  let values = JSON.parse(target.parentElement.dataset.values);
  let _id = target.parentElement.dataset._id;
  let type = target.parentElement.dataset.type;
  let modal = target.closest('.modal');
  values.push(value);
  let saveob = {_id: _id, [type]: values};
  
  //return;
  xhr(saveob, '/backend/updateArrayItem', function(res){
    if(res === 'success'){

      modal.style.display = 'none';
      let select = document.querySelector('#select-'+_id);
      let option = document.createElement("option");
      makeAddBox(value,_id,type,values);
      option.value = value;
      option.textContent = value;
      select.appendChild(option)
      option.setAttribute('selected', 'selected');

    }
    else{
      modal.document.querySelector('.warning').textContent = 'An error occured';
      modal.document.querySelector('.warning').style.display = 'block';
    }
  });
}
// TODO: Requires maintenance function to delete images if no blog post exits.

function makeBlog(query){
  xhr(query, '/backend/blog', function callback(message){
    let maincontent = document.querySelector('.maincontent');
        maincontent.innerHTML = message;
        makeControls();
    let postcontent = document.querySelector('.postcontent');
    let postList = document.querySelector('.postList');
    //@ param querySelector for drop target:
    eventOnAll('.topics', ()=> activateDropDown.setState('topicsfilter').hideOrDisplay());
    events();
    /**
     *
     */

    function events(){
      postList.querySelectorAll('.deletepost').forEach(function(el){
        el.addEventListener('click', function(e){
          e.stopPropagation();
          xhr({_id: e.target.parentElement.dataset.id, title: e.target.parentElement.dataset.title}, '/backend/blogdelete', function(res){
            postList.removeChild(e.target.parentElement);
          });
        });
      });

      postcontent.querySelector('.blogVideo').addEventListener('input', saveVideo);

      function saveVideo(e){
        //upload button:
        e.target.nextSibling.addEventListener('click', function(e){
          e.preventDefault();
          let time = new Date(),
              mill = time.getTime(),
              videodata = {
                timestamp: mill,
                _id: document.querySelector('.postcontent').querySelector('.postview').dataset._id,
                title: document.querySelector('.title').value,
                video: document.querySelector('.blogVideo').files[0]
              },
              form = new FormData(),
              keys = Object.keys(videodata),
              values = Object.values(videodata);

          keys.forEach(function(e, i){
            form.append(keys[i], values[i]);
          });

          formxhr(form, '/backend/saveblogvideo', function callback(response){
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
              makeButton(container, 'deleteButton', 'x', 'delete', deleteVideo);
              makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
              makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);

              document.querySelector('.content').appendChild(container);

              swiftmoAlert.setContent(responseParsed.message).toggle();
              video.scrollIntoView(true);
            }
          });
        });
      }


      let hasClick = 0;

      postcontent.querySelector('.blogImage').addEventListener('input', saveImage);

    function saveImage(event){

      //attach the event to upload button
      if(hasClick === 0){
        event.target.nextSibling.addEventListener('click', function(e){
        hasClick = 1;
        e.preventDefault();

        let id = document.querySelector('.postcontent').querySelector('.postview').dataset._id;

        let time = new Date(),
            mill = time.getTime(),
            imgdata = {
              //itemref: parent.dataset.itemref,
              timestamp: mill,
              _id: document.querySelector('.postcontent').querySelector('.postview').dataset._id,
              title: document.querySelector('.title').value,
              image: document.querySelector('.blogImage').files[0]
            },
            form = new FormData(),
            keys = Object.keys(imgdata),
            values = Object.values(imgdata);
        keys.forEach(function(e, i){
          form.append(keys[i], values[i]);
        });
        formxhr(form, '/backend/saveblogimage', function callback(response){
          let responseParsed = JSON.parse(response);
          if(responseParsed.error){
            swiftmoAlert.setContent(responseParsed.error).toggle();
          }
          else{
            /*if(responseParsed.message === 'Image saved'){
              parent.querySelector(imgInputDiv+'ImgDiv').firstChild.src = responseParsed.link;
            }*/
            let container = document.createElement('div');
                container.style.display = 'flex';
            let img = document.createElement('img');
                img.setAttribute('src', responseParsed.link);
                img.style.maxWidth = '100%'

            container.appendChild(img);
            makeButton(container, 'deleteButton', 'x', 'delete', deleteImage);
            makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
            makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);

            document.querySelector('.content').appendChild(container);

            swiftmoAlert.setContent(responseParsed.message).toggle();
            img.scrollIntoView(true);
          }
        });
      });
      }
    }

    postList.querySelectorAll('.fetchpost').forEach((e)=>{
      e.addEventListener('click', (e)=>{
        xhr({	_id: e.target.parentElement.dataset.id,
          provider: document.getElementById('profile').dataset.provider
        },
        '/backend/blogjson', function callback(message){
          let post = JSON.parse(message).data[0];
          document.querySelector('.title').value = (post && post.title) ? post.title : 'enter a tile';
          document.querySelector('.topicInput').value = (post && post.topics) ? post.topics.toString() : 'enter topics';

          while (document.querySelector('.content').firstChild) {
            document.querySelector('.content').removeChild(document.querySelector('.content').firstChild);
          }
          if(post && post.content){
            post.content.forEach((e)=>{
              makeEditableTextField(e.el, e.cont, '.content');
            });
            document.querySelector('.postdescription').value = post.description;
          }
          if(post && post._id){
            document.querySelector('.postcontent').querySelector('.postview').dataset._id = post._id;
          }
          makeControls();
          document.querySelector('.content').scrollIntoView({block: 'start',  behavior: 'smooth' });
        });
      });
    });
  }

  function makeControls(){
    if(document.querySelector('.controls').firstChild){
      return;
    }
    let elementtypes = ['p', 'em', 'b', 'h1', 'h2', 'h3', 'h4', 'figcaption', 'quotation'];
    let plebNames = ['paragraph',
    'italic text',
    'bold text',
    'h1, main title',
    'h2, sub title',
    'h3, sub sub title',
    'h4, minor title',
    'figcaption, image caption', 'quotation']
    elementtypes.forEach((e, index)=>{
      let b = document.createElement('button');
      b.classList.add('btnbackend', 'uniformdisplay', 'bounceOnHover')
      let eltype = document.createElement(e);
      eltype.textContent = 'Add ' + plebNames[index];
      b.appendChild(eltype);
      document.querySelector('.controls').appendChild(b);

      b.addEventListener('click', function(event){
        event.preventDefault();
        makeEditableTextField(e, null, '.content');
      });
    });
  }


  function makeListItem(id, topics, title){
    let newLi = document.createElement('li');
        newLi.dataset._id = id;
        newLi.dataset.topics = topics;
        newLi.dataset.topics = title;
        newLi.textContent = title;
    let fetch = document.createElement('span');
        fetch.classList.add('bounceOnHover', 'btngreen', 'fetchpost');
        fetch.textContent = 'fetch';
    let del = document.createElement('span');
        del.classList.add('bounceOnHover', 'btnwarn', 'deletepost');
        del.textContent = 'delete';
    newLi.appendChild(fetch);
    newLi.appendChild(del);
    postList.appendChild(newLi);
    events();
  }



  /**
  * 	@param string a html element type
  */
  function makeEditableTextField(elementType, textContent, parentElement){
    let container = document.createElement('div');
    container.style.display = 'flex';
    let el = document.createElement(elementType);

    if(!any(['img', 'video'], elementType)){
      el.setAttribute('contentEditable', true);
      el.classList.add('fieldEditable', 'fieldEditableUp');
      el.textContent = textContent || 'Your text';
      container.appendChild(el);
      document.querySelector(parentElement).appendChild(container);
      makeButton(container, 'deleteButton', 'x', 'delete', deleteParagraph);
      makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
      makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);
    }else if(elementType === 'img'){
      let cleanURL = (textContent.includes('http://localhost:8080')) ? textContent.replace('http://localhost:8080', '.') : textContent;
      el.setAttribute('src', cleanURL);
      container.appendChild(el);
      document.querySelector(parentElement).appendChild(container);
      makeButton(container, 'deleteButton', 'x', 'delete', deleteImage);
      makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
      makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);
    }else if(elementType === 'video'){
      let cleanURL = (textContent.includes('http://localhost:8080')) ? textContent.replace('http://localhost:8080', '.') : textContent;
      el.setAttribute('src', cleanURL);
      el.setAttribute('controls', true);
      el.setAttribute('autoplay', true);
      container.appendChild(el);
      document.querySelector(parentElement).appendChild(container);
      makeButton(container, 'deleteButton', 'x', 'delete', deleteVideo);
      makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
      makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);
    }


    selectElementContents(el);
  }

  function deleteParagraph(e){
    document.querySelector('.content').removeChild(e.target.parentElement);
  }

 function deleteImage(e){

    let url = e.target.previousSibling.src;
    let base = window.location.origin;
    var regex = new RegExp(base,"gi");
    ///base/gi;

    let q = {
      image: url.replace(regex, ''),
      _id: document.querySelector('.title').dataset.id,
      title: document.querySelector('.title').value
    };

    xhr(q, '/backend/blogimagedelete', function(cb){
      document.querySelector('.content').removeChild(e.target.parentElement);
      let cbp = JSON.parse(cb);

      if(cbp.error){
        swiftmoAlert.setContent(cbp.error).toggle();
      }else{
        swiftmoAlert.setContent(cbp.success).toggle();
      }
    });
  }

  //same as delete image:
  function deleteVideo(e){
    let url = e.target.previousSibling.src;
    let base = window.location.origin;
    var regex = new RegExp(base,"gi");
    ///base/gi;
    let q = {
      video: url.replace(regex, ''),
      _id: document.querySelector('.title').dataset.id,
      title: document.querySelector('.title').value
    };

    xhr(q, '/backend/blogvideodelete', function(cb){
      document.querySelector('.content').removeChild(e.target.parentElement);
      let cbp = JSON.parse(cb);

      if(cbp.error){
        swiftmoAlert.setContent(cbp.error).toggle();
      }else{
        swiftmoAlert.setContent(cbp.success).toggle();
      }
    });
  }

  function moveUp(e){
    let toMove = e.target.parentElement;
    document.querySelector('.content').insertBefore(toMove, toMove.previousSibling);
  }

  function moveDown(e){
    let toMove = e.target.parentElement;
    document.querySelector('.content').insertBefore(toMove, toMove.nextSibling.nextSibling);
  }


  swiftmoAlert.set();

  let fetchnew = document.createElement('button');
  fetchnew.classList.add('btnbackend', 'bounceOnHover', 'fetchnew');
  fetchnew.textContent = 'Add new blog post';
  fetchnew.addEventListener('click', function(){
    xhr({}, '/backend/blognew', function(res){
      document.querySelector('.postedit').innerHTML = res;
      makeControls();
      events();
    });
  });
  document.querySelector('.controlbuttonsnew').appendChild(fetchnew);

  let btn = document.createElement('button');
      btn.classList.add('btngreen', 'bounceOnHover', 'savepost');
      btn.textContent = 'save';

  btn.addEventListener('click', function(e){
    e.preventDefault();
    let id =  document.querySelector('.title').dataset.id,
        title =  document.querySelector('.title').value,
        topics = document.querySelector('.topicInput').value,
        description = document.querySelector('.postdescription').value;

    let content = [];

    Array.from(document.querySelector('.content').children).forEach((e)=>{
      let element = e.firstChild;
      if(any(['IMG', 'VIDEO'], element.tagName)){
        content.push({el: element.tagName.toLowerCase(), cont: element.src});


      }
      else{
        content.push({el: element.tagName.toLowerCase(), cont: element.textContent});

      }
    });

    let post = {
      _id: id,
      title: title,
      topics: topics,
      description: description,
      content: content,
    };

    if(typeof document.querySelector('.title').dataset.id === 'undefined'){
      xhr(post, '/backend/blogsavenew', function(success){
        success = JSON.parse(success);
        if(success.error){
          swiftmoAlert.setContent(success.error).toggle();
        }else{
          swiftmoAlert.setContent('Post saved').toggle();
          document.querySelector('.title').dataset.id = success._id;
          makeListItem(success._id, topics, title);
        }
      });
    }else{
      xhr(post, '/backend/blogsave', function(success){
        if(JSON.stringify(success).error){
          swiftmoAlert.setContent(success.error).toggle();
        }else{
          swiftmoAlert.setContent('Post saved').toggle();
        }
      });
    }
  });

  document.querySelector('.controlbuttonssave').appendChild(btn);

});

}


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
				let nodeDataset = Object.values(node.dataset);

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
								node.style.display = 'block';
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
function entityAlterEvents(){
  document.querySelectorAll('.edit').forEach((item1, i) => {
    addTabIndex(item1);
    item1.addEventListener('click', (e)=>{
      //e.target.classList.add('fieldEditableUp');
      e.target.classList.remove('warning');
      e.target.contentEditable = 'true';
      e.target.textContent = '';
      e.target.focus();

      item1.addEventListener('input', (e)=>{
        let type = e.target.dataset.fieldname;
        let value = (isNaN(e.target.textContent)) ? e.target.textContent : parseInt(e.target.textContent);
        xhr({[type]: value}, '/backend/updateEntity', function(cb){
          
        });
      });

    });
  });
  saveTimes();
}

function saveTimes(){
  document.querySelector('.saveShopTimes').addEventListener('click', function(e){
    e.preventDefault();
    xhr({fullShopOpeningHours: shopCalendar.datesSelected(), openingHours: shopCalendar.jsonldFriendlyTimes()}, '/backend/updateEntity', function callback(message){
      swiftmoAlert.setContent('Dates saved').toggle();
    });
  });
}

function saveLocationTimes(calendar, name){
  xhr({[name + '.fullShopOpeningHours']: calendar.datesSelected(), [name + '.openingHours']: calendar.jsonldFriendlyTimes()}, '/backend/updateEntity', function callback(message){
    swiftmoAlert.setContent('Dates saved').toggle();
  });
}

function saveLocation(prop, coordinates){
  
  xhr({[prop]: coordinates}, '/backend/updateEntity', function callback(message){
    swiftmoAlert.setContent('Location saved').toggle();
  });
}


function editEvents(){
  document.querySelectorAll('.edit').forEach((item1, i) => {
    item1.addEventListener('click', (e)=>{
      //e.target.classList.add('fieldEditableUp');
      e.target.classList.remove('warning');
      e.target.classList.add('attention');
      e.target.contentEditable = 'true';
      e.target.focus();


      document.querySelectorAll('.edit').forEach((item, i) => {
        if(item !== item1){
          item.classList.remove('fieldEditableUp', 'attention');
          item.contentEditable = 'false';
        }
      });
    });
  });
}

function addStockChangeEvents(){
  editEvents();
  document.querySelectorAll('.dropdownsave').forEach((item, i) => {
    item.addEventListener('change', (e)=>{

      let type = e.target.dataset.type;
      let value = e.target.options[e.target.selectedIndex].value;
      let itemref = e.target.closest('.itemprofile').dataset.itemref;
      xhr({itemref: itemref, [type]: value}, './updateItemField', function(cb){
        
      });
    });
  });




  /**
    * Filter availble stock by pattern
    * @event Filters the stock items on the page by item
    * @memberof backendEventDelegation
    * @summary Adds the class ".hide" which sets display property to 'none' on not relevant stock items.
    */
  document.querySelectorAll('.filter').forEach((it) => {
    it.addEventListener('change', (e)=>{
      let pattern = document.querySelector('.filterPattern').value;
      let itemtype = document.querySelector('.filterItemType').value;

      document.querySelectorAll('.stockItems').forEach((item) => {
        //if the pattern option isn't selected, return all, if it is activate this option other wise hide:
        let p = (pattern === '') ? true : (item.dataset.pattern === pattern) ? true : false;
        let it = (itemtype === '') ? true : (item.dataset.itemtype === itemtype) ? true : false;

        
        

        if( p && it){
          item.classList.remove('hide');
          item.classList.add('displayFlex');
        }else{
          item.classList.add('hide');
          item.classList.remove('displayFlex');
        }
      });
    });
  });

  /**
    * Filter availble stock by Item Type
    * @event Filters the stock items on the page by item
    * @memberof backendEventDelegation
    * @summary Adds the class ".hide" which sets display property to 'none' on not relevant stock items.
    */
  /*
  document.querySelectorAll('.filterItemType').forEach((it, i) => {
    it.addEventListener('change', (e)=>{
      let itemType = e.target.value;
      document.querySelectorAll('.stockItems').forEach((item, i) => {
        if(item.dataset.itemtype !== itemType){
          item.classList.add('hide');
          item.classList.remove('displayFlex');
        }
        else{
          item.classList.remove('hide');
          item.classList.add('displayFlex');
        }
      });
    });
  });
*/

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
    e.target.focus();
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
/**
  * Backend event delegation
  * @namespace backendEventDelegation
  */

/**
  * Dropdown select and edit
  * @namespace selectAndEdit
  * @memberof backendEventDelegation
  * @description
    The select and edit namespace refers to functions which work with data that
    takes the form of objects in arrays in the DB such as 'theme', 'producer' or
    'item type'. The entire functionality derives from the 'item type' and
    adapted for other uses.
  * @todo Make whipe() work for all select and edits
  */

/**
  * Main menu
  * @namespace mainMenu
  * @memberof backendEventDelegation
  * @description The main menu name space refers to actions associated with
    the main menu which doesn't change.
  */


  /**
    * Onload event
    * @event DOMContentLoaded
    * @summary fires alert constructor, warns if not on a HTTPS connection and
    * @fires SwiftCal#calendar
    * @fires swiftmoAlert#set
    * @todo Check why it does use xhr module.
    * @memberof backendEventDelegation
    */
window.addEventListener('DOMContentLoaded', (event) => {
  swiftmoAlert.set();
  if (location.protocol !== 'https:' ) {
    //swiftmoAlert.setContent('Reminder, make sure you connect over https for testing.').toggle();
    console.warn('not over https');
  }
  if(window.location.pathname === '/app-set-up') {
    entityAlterEvents();
    editEvents();
  }
});

document.addEventListener('click', function(e){
  if(e.target.classList.contains('submitNewUser')){
    e.preventDefault();
    if(document.querySelector('[name="password"]').value !== document.querySelector('[name="passwordCheck"]').value){
      swiftmoAlert.setContent('Password doesn\'t match the repeat password').toggle();
      return;
    }else{
      let form = new FormData();
          form.append('username', document.querySelector('[name="username"]').value);
          form.append('password', document.querySelector('[name="password"]').value);
          formxhr(form, '/register-seed-user', (response)=>{
            swiftmoAlert.setContent(response + ' Redirecting to the backend in a moment.').toggle();
            window.setTimeout(function(){
              window.location.pathname = '/backend';
            }, 1500);
          });
    }
  }
  /**
    * Login
    * @event Login button click
    * @summary Simply authenticates with the server and reloads the page.
    * @todo Check why it does use xhr module.
    * @memberof backendEventDelegation
    */
  if(e.target.classList.contains('loginButton')){
    e.preventDefault();
    let data = {
      username: document.querySelector('#username').value,
      password: document.querySelector('#password').value,
    };

    let request = new XMLHttpRequest();
    request.open('POST', '/backend/backendlogin', true);
    request.setRequestHeader('Content-Type', "application/json");
    request.send(JSON.stringify(data));
    request.onreadystatechange = function (callback) {
      if(request.readyState === XMLHttpRequest.DONE && request.status === 200) {
        location.reload();
      }
      if(request.status === 401){
        document.querySelector('.loginError').innerHTML =
        "Unauthorized. Please check your username and password.";
      }

    };
  }

  if(e.target.classList.contains('logout')){
    e.preventDefault();
    xhr({}, '/backend/logout', function callback(message){
      if(message === 'OK'){
        location.reload();
      }
    });
  }

  if(e.target.id === 'docs'){
    e.preventDefault();
    xhr({'user': document.getElementById('profile').dataset.user}, '/backend/docs', function callback(message){
      document.querySelector('.maincontent').innerHTML = message;
    });
  }

  if(e.target.classList.contains('toggleDocs')){
    e.preventDefault();
    let docs = document.querySelectorAll('.microdocs');
    for (let i = 0; i < docs.length; i++) {
      if(any(['block',''], docs[i].style.display)){
        docs[i].style.display = 'none';

      }else{
        docs[i].style.display = 'block';
      }
    }
  }

  /**
    * Clone Item
    * @event Clones the specified number of a particular item type with a particular pattern
    */
  if(e.target.classList.contains('cloneType')){
    e.preventDefault();
    let itemref = JSON.parse(e.target.parentElement.parentElement.dataset.items)[0].itemref;
    let count = e.target.parentElement.querySelector('.numberInput').value;
    xhr({itemref: itemref, count: count}, '/backend/cloneItem', function callback(response){
      if(response === 'OK'){
        let countdisplay = e.target.parentElement.querySelector('.countval');
        countdisplay.textContent = parseInt(countdisplay.textContent) + parseInt(count);
      }else{
        alert('oops an error occured');
      }
    });
  }

  if(e.target.classList.contains('indexItem')){
    e.preventDefault();
    let itemref = JSON.parse(e.target.parentElement.parentElement.dataset.items)[0].itemref;
    let count = parseInt(e.target.parentElement.parentElement.querySelector('.countval').textContent);
    if(count < 2){
      swiftmoAlert.setContent(`You need at least one item in stock to index it, clone more items`).toggle();
    }

    xhr({itemref: itemref, count: count}, '/backend/indexItem', function callback(response){
      if(response === 'OK'){
        let affirm = document.createElement('div');
            affirm.classList.add('affirm');
        let em = document.createElement('em');
            em.textContent = `Item type last indexed on ${response}`;
            affirm.appendChild(em);
        e.target.parentElement.nextSibling.appendChild(affirm);
      }else{
        alert('oops an error occured');
      }
    });
  }


  if(e.target.classList.contains('editItem')){
    e.preventDefault();

    let all = JSON.parse(e.target.parentElement.parentElement.dataset.items);
    let itemref = all[0].itemref;
    let count = e.target.parentElement.querySelector('.numberInput').value;
    xhr({itemref: itemref, count: count, allItems: all}, '/backend/editItem', function callback(response){
      e.target.parentElement.parentElement.nextElementSibling.innerHTML = response;
      e.target.parentElement.parentElement.nextElementSibling.scrollIntoView({block: 'start', behavior: 'smooth', inline: 'center'});
      attachImageLoadEvent();
      addStockChangeEvents();
      addOption();

      document.querySelectorAll('.currency').forEach((item, i) => {
        new CurrencyInput(item, 'EUR');
      });

      document.querySelectorAll('.fuzzySearch').forEach((item, i) => {
        new FuzzySearch(item.nextSibling);
      });


      document.querySelectorAll('.tax').forEach((item, i) => {
        new PercentInput(item);
      });

      circleEvents();

      /*if(response === 'OK'){
        let countdisplay = e.target.parentElement.querySelector('.countval');
        countdisplay.textContent = parseInt(countdisplay.textContent) + parseInt(count);
      }else{
        alert('oops an error occured');
      }*/
    });
  }

  if(e.target.classList.contains('removeTemplateItem')){
    e.preventDefault();
    removeItems(e, true);
  }

  /**
    * Clone Item
    * @event Clones the specified number of a particular item type with a particular pattern
    */
  if(e.target.classList.contains('removeItems')){
    e.preventDefault();
    removeItems(e, false);
  }

  function removeItems(e, templateItem){
    let itemrefs = JSON.parse(e.target.parentElement.parentElement.dataset.items);
    let count = e.target.parentElement.querySelector('.numberInput').value;
    let itemtype = e.target.parentElement.parentElement.dataset.itemtype;

    let toDelete = ()=> {
      if(count < itemrefs.length){
        return itemrefs.slice(itemrefs.length - count);
      }else{
        return itemrefs
      }
    }
    //template item is a boolean
    let query = (templateItem) ?  {itemtype: itemtype, itemrefs: toDelete(), templateItem: true}: {itemtype: itemtype, itemrefs: toDelete()};
    if(templateItem){
      if(window.confirm('Warning, deleting a template item will mean the item information will be lost, are you sure you want to continue?')){
        deletefn();
      }
    }
    else{
      if(window.confirm('Are you sure you want to remove ' + count + ' items from stock?' )){
        deletefn();
      }
    }

    function deletefn(){
      xhr(query, '/backend/removestock', function callback(response){
        if(response === 'OK'){
          let countdisplay = e.target.parentElement.querySelector('.countval');
          let val = parseInt(countdisplay.textContent) - parseInt(count);
          let card = e.target.parentElement.parentElement;
          let page = document.querySelector('.maincontent');
          if(val < 0){
            page.removeChild(card);
          }else{
            countdisplay.textContent = val
          }
        }else{
          alert('oops an error occured');
        };
      });
    }
  }

  /**
    * Reset Filters
    * @event Reset Filters
    * @summary Toggle all stock elements to visible (removes "hide" class, adds "displayFlex" class)
    * @memberof backendEventDelegation
    */
  if(e.target.classList.contains('resetFilters')){
    e.preventDefault();
    document.querySelectorAll('.stockItems').forEach((item, i) => {
      item.classList.remove('hide');
      item.classList.add('displayFlex');
    });
  }

  if(e.target.id === 'sales'){
    e.preventDefault();
    xhr({'user': document.getElementById('profile').dataset.user}, '/backend/sales', function callback(message){
      document.querySelector('.maincontent').innerHTML = message;
    });
  }

  if(e.target.classList.contains('uploadvideo')){
    e.preventDefault();
    saveVideo(e.target.previousSibling);
  }

  if(e.target.classList.contains('togglemodal')){
    let associatedModal = e.target.nextElementSibling;
    toggle.setinst(associatedModal);
    toggle.tog(associatedModal, 'block');
    associatedModal.querySelector('.circleClose').addEventListener('click', function(){
      toggle.tog(associatedModal, 'none');
    })
  }

  if(e.target.id === 'shop'){
    e.preventDefault();
    xhr({'user': document.getElementById('profile').dataset.user}, '/backend/shopchoices', function callback(message){
      document.querySelector('.maincontent').innerHTML = message;
      attachImageLoadEvent();
      addStockChangeEvents();

    });
  }

  /**
    * Toggle entity view
    * @event Load Entity view
    * @summary Loads and toggle entity view
    * @fires SwiftCal#calendar
    * @memberof backendEventDelegation
    */
  if(e.target.id === 'entity'){
    e.preventDefault();
    xhr({'user': document.getElementById('profile').dataset.user}, '/backend/entity', function callback(message){
      document.querySelector('.maincontent').innerHTML = message;
      let businessTimetable = document.querySelectorAll('.locationTimetable')[0];

      shopCalendar = new SwiftCal().calendar(businessTimetable, JSON.parse(businessTimetable.dataset.dates), 12, true, false, false, true);

      let shopLocation = new MapFunctions('.locationMap', '400px');
      shopLocation
        .generateMap('https://tile.openstreetmap.org/${z}/${x}/${y}.png	')
        .locateOnClick(true, null, null, false)
        .invalidateSize();

      if($('.locationMap').dataset.location &&
            JSON.parse($('.locationMap').dataset.location).lat &&
              JSON.parse($('.locationMap').dataset.location).lng){
        let location = JSON.parse($('.locationMap').dataset.location);
        shopLocation.addGuideMarker(location, 'Business location ' + location.lat + ',' + location.lng);
      }

      $('.locationMap').addEventListener('click', function(){
        let co = shopLocation.returnCoordinates();
        $('.locationMap').nextSibling.textContent = 'Your chosen coordinates' + co.lat + ',' + co.lng;
      });

      $('.locationMap').nextSibling.nextSibling.addEventListener('click', function(){
        e.preventDefault();
        saveLocation('location', shopLocation.returnCoordinates());
      });

      let calendars = [];
      let maps = [];
      if($('.pointsOfSale').firstChild){
        let locations = document.querySelector('.pointsOfSale').querySelectorAll('.locationTimetable');
        for (let i = 0; i < locations.length; i++) {
          calendars[i] = new SwiftCal().calendar(locations[i], JSON.parse(locations[i].dataset.dates), 12, true, false, false, true);
          locations[i].nextSibling.addEventListener('click', function(){
            e.preventDefault();
            saveLocationTimes(calendars[i], locations[i].dataset.fieldname);
          });
        }
        let coordinates = document.querySelector('.pointsOfSale').querySelectorAll('.locationMap');
        for (let i = 0; i < coordinates.length; i++) {
          let location = JSON.parse(coordinates[i].dataset.location);
          maps[i] = new MapFunctions(coordinates[i], '400px');
          maps[i].generateMap('https://tile.openstreetmap.org/${z}/${x}/${y}.png')
            .locateOnClick(true, null, null, false)
            .invalidateSize();

          if(location.lat){
            maps[i].addGuideMarker(location, 'Business location ' + location.lat + ',' + location.lng);
          }

          coordinates[i].nextSibling.nextSibling.addEventListener('click', function(){
            e.preventDefault();
            saveLocation(coordinates[i].dataset.fieldname + '.location', maps[i].returnCoordinates());
          });
        }
      }
      entityAlterEvents();

    });
  }

  if(e.target.classList.contains('baseelem')){
    let target = document.querySelector('.pointsOfSale').querySelectorAll('.singlePointOfSale')[0];
    addNewPointOfSale(target);
  }

  if(e.target.id === 'viewstock'){
    e.preventDefault();
    xhr({'user': document.getElementById('profile').dataset.user}, '/backend/viewstock', function callback(message){
      document.querySelector('.maincontent').innerHTML = message;
      addStockChangeEvents();
      attachImageLoadEvent();
    });
  }
  /**
    * Add stock
    * @event Stock add app.
    * @summary Loads a providers "add stock" view.
    * @description
      Loads provider stock view into maincontent and sets core functionality
    * @todo Change name to addStock
    * @memberof backendEventDelegation
    */
  if(e.target.id === 'addstock'){
    e.preventDefault();
    xhr({'user': document.getElementById('profile').dataset.user}, '/backend/addstock', function callback(message){
      document.querySelector('.maincontent').innerHTML = message;
      attachImageLoadEvent();
      addStockChangeEvents();
      addOption();

      document.querySelectorAll('.currency').forEach((item, i) => {
        new CurrencyInput(item, 'EUR');
      });

      document.querySelectorAll('.fuzzySearch').forEach((item, i) => {
        new FuzzySearch(item.nextSibling);
      });


      document.querySelectorAll('.tax').forEach((item, i) => {
        new PercentInput(item);
      });

      circleEvents();
    });
  }

  function circleEvents(){
    document.querySelectorAll('.arraymodaltype').forEach((e)=>{
      toggle.setinst(e);
      e.querySelectorAll('.circleClose').forEach((item, i) => {
        item.addEventListener('click', ()=>{
          toggle.tog(document.querySelector('.itemtypesuccess'), 'none');
          toggle.tog(e, 'none');
        });
      });

      e.querySelectorAll('.save').forEach((el)=>{
        el.addEventListener('click', ()=>{
          saveFn(el)
        });
      });
    });
  }

  /**
    * Expand
    * @event Show the next relevant content
    * @memberof backendEventDelegation
    * @summary Remove the class ".hide" which sets display property to 'none'.
    */
  if(e.target.classList.contains('expand')){
    e.target.closest('p').nextSibling.classList.remove('hide');
    e.target.style.display = 'none';
    e.target.parentElement.querySelector('.contract').style.display = 'block';
  }

  /**
    * Contract
    * @event Hide the next relevant content
    * @memberof backendEventDelegation
    * @summary Adds the class ".hide" which sets display property to 'none'.
    */
  if(e.target.classList.contains('contract')){
    e.target.closest('p').nextSibling.classList.add('hide');
    e.target.style.display = 'none';
    e.target.parentElement.querySelector('.expand').style.display = 'block';
  }

  /**
    * Remove a thing
    * @event Delete a thing, e.g. an item type
    * @memberof backendEventDelegation.selectAndEdit
    * @todo Check if whipe to clear fields in all eventualities. Check what
    happens to FuzzySearch.
    * @see FuzzySearch
    * @summary Maps relevant content from button position to the containing
     modal then deletes the thing the view pertains to. Finally, it removes the
     deleted thing name from the drop down select.
    */
  if(e.target.classList.contains('remove')){
    let _id = e.target.parentElement.dataset._id,
        type = e.target.parentElement.dataset.type,
        modal = document.querySelector('#addNewModal-'+type),
        values = JSON.parse(modal.dataset.values),
        value = e.target.parentElement.previousSibling.textContent,
        parent = e.target.parentElement.parentElement,
        parentParent = e.target.parentElement.parentElement.parentElement;

        parentParent.removeChild(parent);
        values.splice(values.indexOf(value), 1);
        modal.dataset.values = JSON.stringify(values);

    let saveob = {_id: _id, [type]: values};
      xhr(saveob, '/backend/updateArrayItem', function(res){
        if(res === 'success'){
          //alter select list
          swiftmoAlert.setContent(type + 'successfully updated.').toggle();
          whipe();
          let select = document.querySelector('#select-'+_id);
          let opt = select.querySelector("option[value='"+value+"']")
              select.removeChild(opt);
        }
        else{
          modal.document.querySelector('.warning').textContent = 'An error occured';
          modal.document.querySelector('.warning').style.display = 'block';
        }
      });
  };

  /**
    * Edit item type (modal dialog toggle)
    * @event Toggle edit modal
    * @description
      It opens the modal dialog for a particular thing, then loads the data into
       the relevant fields in the modal from a data attribute in the previous
       select option.
    * @memberof backendEventDelegation.selectAndEdit
    */
  if(e.target.classList.contains('editmodal')){
    let field = e.target.parentElement.dataset.field,
        /**
          * @var {string} fieldCss
          * @description
            fieldCss is used in HTML attributes replacing spaces with underscores.
             Where possible though spaces are maintained.
          * @example 'item type' becomes 'item_type'
          */
        fieldCss = field.replace(' ', '_'),
        targetField = document.querySelector('#editmodal-' + fieldCss),
        filtered = e.target.parentElement.previousSibling,
        itemType = filtered.value,
        data = (filtered[filtered.selectedIndex].dataset.iteminfo) ?
          JSON.parse(filtered[filtered.selectedIndex].dataset.iteminfo) :
          {dimensions: [0,0,0], weight: 0, name: ''};

    targetField.style.display = 'block';
    document.querySelector('#'+fieldCss).textContent = data.name;
    document.querySelector('#'+fieldCss).dataset.newname = data.name;

    if(field === 'item type'){
      document.querySelector('.x').textContent = data.dimensions[0];
      document.querySelector('.y').textContent = data.dimensions[1];
      document.querySelector('.z').textContent = data.dimensions[2];
      document.querySelector('.itemNewWeight:not(.parent)').textContent = data.weight;
    }

    if(field === 'producer'){
      document.querySelector('.producerIntro').textContent = data['quick intro'];
      document.querySelector('.producerType').textContent = data.type;
    }

    if(field === 'theme'){
      let post = document.querySelector('#editmodal-theme').querySelector('#select-blogPost');

      if(data.colours){
        data.colours.forEach((item, i) => {
          let collection = targetField.querySelector('.colours').querySelectorAll('.array');
          collection[i].textContent = item;
        });
      }
      if(data['meta description']){
        $('.themeDescription').textContent = data['meta description'];
      }
      if(data['linked post']){
        setOption(post, data['linked post']);
      }
    }

    //any thing with images:
    if(any(['theme','producer'], field)){


      targetField.querySelectorAll('.distinctImage')[0].querySelector('.title').textContent = data.name + ' images';

      let input = targetField.querySelector('.characterCountInput'),
          display = targetField.querySelector('.characterCount');

      characterCount(input, display, 160);

      rightpics(targetField, data);

      addTabIndex(targetField);

      addImageEvent();
    }

  }

  /**
    * Add theme
    * @event Add theme
    * @fires resetImages
    * @fires resetItemFields
    * @description Whipes image and text fields in the same modal dialog as the
    * click event on the element on to which this is listening.
    * @memberof backendEventDelegation
    */
  if(e.target.classList.contains('add-theme')){

    resetImages(e.target, 'theme');
    resetItemFields(e.target, 'theme');
  }

  /**
    * Add producer event
    * @event  Add producer
    * @fires resetImages
    * @fires addItemType
    * @description Whipes field, highlights field (changes css class), sets
    * contentEditable === 'true'
    * @memberof backendEventDelegation.selectAndEdit
    */
  if(e.target.classList.contains('add-producer')){
    resetImages(e.target, 'producer');
    addItemType([ document.querySelector('#itemNewName-producer'),
                  document.querySelector('.producerIntro'),
                  document.querySelector('.producerType')
                ]);

  }

  /**
    * Add item type event
    * @event Add item type
    * @fires whipe - whipes item_type text fields
    * @fires addItemType - sets editable "true" on each field passed.
    * @description whipes item type modal fields, then makes editable
    * @memberof backendEventDelegation.selectAndEdit
    */
  if(e.target.classList.contains('add-item_type')){
    whipe();
    addItemType([
                  document.querySelector('#item_type'),
                  document.querySelector('.itemNewWeight')
                ]);
    editDimensions(e.target);
  }

  /**
    * Edit dimensions event
    * @event Edit dimensions
    * @fires editDimensions
    * @summary - Whipe and sets editable "true" on each field with the .dimensions
    * class within the div.
    * @description
      - The dimensions class could be used to save any array like data.
    * @see Add item type, dimensions are a property of an item type.
    * @memberof backendEventDelegation.selectAndEdit
    */
  if(e.target.classList.contains('editdimensions')){
    editDimensions(e.target);
  }

  /**
   * Delete image:
   * @event Delete image
   * @fires deleteImage
   * @see deleteImage
   * @memberof backendEventDelegation
   */
  if(e.target.classList.contains('deleteImage' && e.target.dataset.type !== 'stock')){
    deleteImage(e.target);
    //updateData(e.target);
  }

  /**
   * Delete item type:
   * @event Delete item type
   * @see deleteImage
   * @description It collects the the name of the thing to delete and the type
    then for it to delete, then removes the relevant select option field.
   * @memberof backendEventDelegation.selectAndEdit
   * @todo Might be a duplicate of "remove"
   */
  if(e.target.classList.contains('deleteItemType')){
    let modal = e.target.closest('.stockModal');
    let name = modal.querySelector('.itemNewName').textContent;
    let _id = e.target.dataset._id;
    let type = e.target.dataset.itemtype;
    let saveob = {name: name, type: type};

    xhr(saveob, '/backend/deleteItemType', function(res){
      if(res === 'OK'){
        //successDiv.innerHTML = res;
        resetImages(e.target, type.replace(' ', '_'));
        resetItemFields(e.target, type.replace(' ', '_'));
        toggle.tog(modal.parentElement, 'none');

        swiftmoAlert.setContent(res + ' deleting ' + name + ' ' + type).toggle();
        //whipe();
        //toggle.setinst(successDiv);
        //toggle.tog(successDiv, 'block');

        let select = document.querySelector('#select-'+type.replace(' ', '_'));
            select.removeChild(select.options[select.selectedIndex]);
      }
      else{
        modal.querySelector('.warning').textContent = 'An error occured';
        modal.querySelector('.warning').style.display = 'block';
      }
    });

  }

  if(e.target.classList.contains('savestock')){
    savenew(e.target);
  }

  if(e.target.classList.contains('editstock')){
    saveItemEdit(e.target);
  }


  if(e.target.classList.contains('saveitemtype')){

    if(e.target.dataset.itemtype === 'item type'){
      let data = [];
      data.push(parseInt(document.querySelector('.x').textContent));
      data.push(parseInt(document.querySelector('.y').textContent));
      data.push(parseInt(document.querySelector('.z').textContent));
      let name = document.querySelector('#item_type').textContent;
      if(name.match(/(&nbsp)/g)){
        alert('That item name includes HTML Char &nbsp, type the value in instead of cut and paste.');
        return;
      }
      if(name.match(/([ ]{2,})/g)){
        alert('That item name includes double spacing or new line characters or HTML entities, this name isn\'t allowed');
        return;
      }

      let weight = parseInt(document.querySelector('.itemNewWeight').textContent);
      let itemgroup = (document.getElementById('item_type.item_group').textContent.length > 1) ?
                        document.getElementById('item_type.item_group').textContent :
                        document.getElementById('select-item_type.item_group').value;

      let _id = e.target.parentElement.dataset._id;

      let updates = {dimensions: data, weight: weight, name: name, 'item group': itemgroup, itemtype: 'item type'};



      let saveob = {_id: _id, updates};

      save(saveob);
      writeThemeChanges(updates, 'item_type');
    }

    if(e.target.dataset.itemtype === 'producer'){
      let _id = e.target.parentElement.dataset._id,
          name = document.querySelector('#itemNewName-producer').textContent,
          intro = document.querySelector('.producerIntro').textContent,
          type = document.querySelector('.producerType').textContent,
          updates = { Producer: 'artist',
                      '@type': 'person',
                      name: name,
                      'quick intro': intro,
                      type: type,
                      itemtype: 'producer'},
          saveob = {_id: _id, updates};

      save(saveob);


      document.querySelector('#editmodal-theme').style.display = 'none';
    }
    if(e.target.dataset.itemtype === 'theme'){

      let _id = e.target.parentElement.dataset._id,
          name = document.querySelector('#theme').textContent,
          description = document.querySelector('.themeDescription').textContent,
          post = document.querySelector('#editmodal-theme').querySelector('#select-blogPost').value,
          bespoke = document.querySelector('[data-fieldname="for bespoke"]').querySelector('[type="checkbox"]').checked,
          updates = {
                      name: name,
                      colours: getArrayTypeInput($('.colours')),
                      itemtype: 'theme',
                      'meta description': description,
                      'linked post': post,
                      //JSON.parse(optData(post, 'iteminfo')).title,
                      'for bespoke': bespoke
                    },
          saveob = {_id: _id, updates};

      save(saveob);
      writeThemeChanges(updates, 'theme');

      document.querySelector('#editmodal-theme').style.display = 'none';
    }

  }

  if(e.target.classList.contains('viewEdit')){
    let _id = e.target.parentElement.dataset._id,
        type = e.target.parentElement.dataset.type,
        values = JSON.parse(e.target.parentElement.dataset.values);
        toggle.setinst(e.target.parentElement.parentElement.nextElementSibling);
        toggle.tog(e.target.parentElement.parentElement.nextElementSibling, 'block')

    //e.target.parentElement.parentElement.nextElementSibling.classList.remove('hide');
  }

  /*if(e.target.id === 'blog'){
    e.preventDefault();
    xhr({'user': document.getElementById('profile').dataset.user}, '/backend/blognew', function callback(message){
      document.querySelector('.maincontent').innerHTML = message;
    });
  }*/

  if(e.target.id === 'blog'){
    let query = {};
    makeBlog(query);
    attachImageLoadEvent();
  }

});
/**
 * Filter select list.
 * @class
 * @param {HTMLelement} node select list to filter.
 * @summary Filters a select list.
 * @description Based on the input of the previous input element, the select
 * list is filtered. N.b. elements must be adjacent and of type "input='text'"
 * and "select". Call a fuzzy search by passing the element itself (i.e. get it
 * first via selector).
 * @example
 *    new FuzzySearch({select element});
 * @todo Check how it behaves when new elements are added interactively.
 */
function FuzzySearch(filtered){
    let list = [];
    let data = []

    Array.from(filtered.children).forEach((item, i) => {
      list.push(item.value);
      data.push(item.dataset.iteminfo);
    });

  this.pushToList = function(name, data){
    list.push(name);
    data.push(data);
    return this;
  }

  filtered.previousSibling.addEventListener('input', function(e){
    let searchText = e.target.value;
    //let filtered = document.querySelector('.filtered');

    while (filtered.firstChild) {
      filtered.removeChild(filtered.lastChild);
    }

    list.forEach((e, i)=>{
      if(e.includes(searchText)){
        let opt = document.createElement('option');
        opt.value = e;
        opt.textContent = e;
        opt.dataset.iteminfo = data[i];
        filtered.appendChild(opt);
      }

    });
  });
  let itemname = (filtered.parentElement && filtered.parentElement.nextElementSibling ) ?
                  filtered.parentElement.nextElementSibling.querySelector('.itemNewName') :
                  null;
  if(itemname){
    let warning = itemname.parentElement.parentElement.querySelector('.warning');
    itemname.addEventListener('input', (e)=>{
      let searchText = e.target.textContent;
      for (let i = 0; i < list.length; i++) {
        if(list[i] === searchText){
          warning.textContent = searchText + ' is already in use, choose another name unless you mean to overwrite it ' + searchText;
          warning.classList.remove('hide');
          break;
        }
        else{
          warning.textContent = '';
          warning.classList.add('hide');
        }
      }
    });
  }

}
const imageAPI = (function imageAPI(){
	let canvas;
	let ctx;
	let input;
	let imgStore = [];

	return obj = {
			setUpCanvas :
				function setUpCanvas(a, b, c){
					
					
					
					canvas = document.querySelector(a);
					ctx = canvas.getContext(b);
					input = document.querySelector(c);
					//document.querySelector('input[type=file]');
					input.onchange = function () {
					  var file = input.files[0];
						obj.drawOnCanvas(file, ctx, canvas);
					};
					return this;
				},
			drawOnCanvas :
				function drawOnCanvas(file, ctx, canvas){
					let reader = new FileReader();
				  reader.onload = function (e) {
				    let dataURL = e.target.result;
						let img = new Image();
				    img.onload = function() {
				      //canvas.width = img.width;
				      //canvas.height = img.height;
				      ctx.drawImage(img, 0, 0, img.width, img.height,     // source rectangle
				                   0, 0, canvas.width, canvas.width * (img.width /img.height)); // destination rectangle;
				    };
				    img.src = dataURL;
				  };
					obj.displayTitle(canvas);
					
				  reader.readAsDataURL(file);
					//obj.saveImage(canvas);

					return this;
				},
			displayTitle : function(canvas){
				if(canvas.previousSibling.tagName ='P'){
					canvas.previousSibling.textContent = 'New item image:';
				}
				return this;
			},
			saveImage :
				/*This is a bit ugly, currentNewItem is a global that keeps getting changed,
				  so as to 'capture' it's state at save along with the image we're passing
					it to saveImage(). Note that currentNewItem as it exists in the global
					scope might well be different */
				function saveImage(canvas, currentNewItem, callback){
					//let file = canvas.toDataURL();
					if(canvas){
						let form = new FormData();
							for ( var key in currentNewItem ) {
							  form.append(key, currentNewItem[key]);
							}
							form.append("image", input.files[0]);
							
						formxhr(form, '/backend/saveitemimage', function callback(response){
							callback(response);
						});
					}
					return this;
				},
			loadImageToCanvas :
				function loadCanvas(dataURL, canvas, context) {
					let reader = new FileReader();
					reader.onload = function(event){
						let img = new Image();
					  img.onload = function() {
					    canvas.width = img2.width;
					    canvas.height = img2.height;
					    imgheight = img2.height;
					    imgwidth = img2.width;
					    ctx.drawImage(this, 0, 0, imgwidth, imgheight);
						}
						img.src = event.target.result;
					}
					reader.readAsDataURL(e.target.files[0]);
					return this;
				}
		};
})();
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
document.addEventListener('keydown', (e)=>{
  if(e.code === 'Space' && document.querySelector('.alertmodal').style.display === 'block'){
    e.preventDefault();
    toggle.tog('.alertmodal', 'none');
    e.stopPropagation();
  }
  if ((e.key == 's') && (e.altKey )){
    e.preventDefault();
    document.querySelector('#viewstock').click();
  }
  if ((e.key == 'a') && (e.altKey )){
    e.preventDefault();
    document.querySelector('#addstock').click();
  }
  if ((e.key == 's') && (e.shiftKey )&& (e.altKey )){
    e.preventDefault();
    document.querySelector('#sales').click();
  }
  if ((e.key == 'b') && (e.altKey )){
    e.preventDefault();
    document.querySelector('#blog').click();
  }
  if ((e.key == 'd') && (e.altKey)){
    e.preventDefault();
    document.querySelector('.toggleDocs').click();
  }
});


function makeButton(parent, id, character, title, fn, canvas, file) {
	var base = document.createElement('p');
			base.id = id;
			base.textContent = character;
			parent.appendChild(base);
			base.title = title;
			base.classList.add('deleteButton');
			base.addEventListener('click', function(e) {
				fn(e, canvas, file);
			});
}


/**
  * Add item type function
  * @function addItemType
  * @param {object[]} array of HTML elements to be set as editable
  * @description This function essentially sets editable attribute to true,
  * the first element in the provided array is focused
  */
function addItemType(fields){
  fields.forEach((item, i) => {
    item.textContent = (item.classList.contains('itemNewWeight')) ? 0 : '';
    item.classList.add('fieldEditableUp');
    item.contentEditable = 'true';
  });
  fields[0].focus();
};


//target is the delete button
function deleteVideo(target){
	let videolink, update, type, name;

			videolink = target.closest('.distinctVideo').querySelector('videoDisplay').src;
		

/*
	if(target.dataset.edit !== 'true'){
			update = updateData(target);
			type = target.dataset.type;
			name = document.querySelector('#'+type).textContent;

		xhr({link: videolink, itemtype: type, name: name, 'image links': update}, '/backend/deleteImage', (res)=>{
			if(res === 'success') swiftmoAlert.setContent('Image successfully deleted.').toggle();

			if(target.closest('.images').querySelectorAll('.distinctImage').length > 1){
				target.closest('.distinctImage').remove();
			}
			else{
				target.closest('.distinctImage').querySelector('.imagetype').value = '';
				target.closest('.distinctImage').querySelector('img').src = '';
				target.closest('.distinctImage').querySelector('.imageInput').files[0] = '';
			}
		})
	}
	else{
		//hacky, lazy way of not having to create a different class or uploader:
		//deleteStockImage(target);
	}
	*/
}

/**
  * Delete image
  * @function deleteImage
  * @param {HTMLelement} node - Element
  * @description
    Deletes the closest "add image". May or may not work in a diferent context.
  * @memberof backendEventDelegation.selectAndEdit
  * @todo display an error to the client if the image isn't deleted
  */
function deleteImage(target){
	let imglink, update, type, name;
		imglink = target.closest('.distinctImage').querySelector('img').src.split('/images')[1];

	if(target.dataset.edit !== 'true'){
		update = updateData(target);
		type = target.dataset.type;
		name = document.querySelector('#'+type).textContent;

		xhr({link: '/images'+imglink, itemtype: type, name: name, 'image links': update}, '/backend/deleteImage', (res)=>{
			if(res === 'success') swiftmoAlert.setContent('Image successfully deleted.').toggle();

			if(target.closest('.images').querySelectorAll('.distinctImage').length > 1){
				target.closest('.distinctImage').remove();
			}
			else{
				target.closest('.distinctImage').querySelector('.imagetype').value = '';
				target.closest('.distinctImage').querySelector('img').src = '';
				target.closest('.distinctImage').querySelector('.imageInput').files[0] = '';
			}
		})
	}
	else{
		//hacky, lazy way of not having to create a different class or uploader:
		deleteStockImage(target);
	}
}



//specific to edit screen
function deleteStockImage(target){

	let imglink, itemref, theme, itemtype;

			imglink = target.closest('.distinctImage').querySelector('img').src.split('/images')[1];
			itemref = target.closest('.distinctImage').dataset.itemref;
			theme = target.dataset.theme;
			itemtype = target.dataset.type;

	xhr({link: '/images'+imglink, theme: theme, itemtype: itemtype, itemref: itemref}, '/backend/updateOrDeleteStockItemImage', (res)=>{
		if(res === 'success'){
			swiftmoAlert.setContent('Image successfully deleted.').toggle();
		}
		if(target.closest('.images').querySelectorAll('.distinctImage').firstChild){
			target.closest('.distinctImage').remove();
		}
		else{
			target.closest('.distinctImage').querySelector('.imagetype').value = '';
			target.closest('.distinctImage').querySelector('img').src = '';
			target.closest('.distinctImage').querySelector('.imageInput').files[0] = '';
		}
	})
}

function updateData(target){
	
	if(!target.dataset.type === 'stock'){
		//this is designed to work with select menus for producers, item type, themes.
		let sel = $('#select-'+ target.dataset.type),
		val = document.querySelector('#'+target.dataset.type).dataset.newname,
		imglink = '/images' + target.closest('.distinctImage').querySelector('img').src.split('/images')[1],
		toUpdate = getOptionByValue(sel, val).dataset.iteminfo,
		parseDataItem = JSON.parse(toUpdate),
		images = parseDataItem['image links'],
		index = images.indexOf(decodeURI(imglink));

		if(index > -1){
			parseDataItem['image links'] = images.splice(index, 1) && images;
			toUpdates = JSON.stringify(parseDataItem);
			return parseDataItem;
		}
	}
}



function addNewPointOfSale(target){
 	let clone = target.cloneNode(true);

	document.querySelector('.pointsOfSale').appendChild(clone);

	let cal = clone.querySelector('.locationTimetable');
						cal.replaceChildren();

	let newcal = new SwiftCal().calendar(cal, null, 12, true, false, false, true);
	let fields = clone.querySelectorAll('[data-fieldname]');
	for (let i = 0; i < fields.length; i++) {
		fields[i].dataset.fieldname = 'otherPointsOfSale.' + document.querySelector('.pointsOfSale').childNodes.length -1 + '.'+ fields[i].dataset.fieldname;
		if(i === fields.length-1){
			entityAlterEvents();
		}
	}

	let titles = document.querySelectorAll('.switchtitle');
	for (let i = 0; i < titles.length; i++) {
		titles[i].textContent = titles[i].textContent.replace(/(.usiness)/g, 'Point of sale');
	}

}

/**
  * Make new add image div
  * @function makeAddImage
  * @param {HTMLelement} node - Element containing the add image applet.
  * @param {string} name - The image name, typically "new" for a new image or
    a given label, or in an image link as the first term after the '-' symbol &
    without the file extention.
  * @param {string} link - The link to the image on the server.
  * @fires attachImageLoadEvent
  * @description - This function clones the image add applet so that more images
    can be added for a given thing.
  * @memberof backendEventDelegation.selectAndEdit
  */
function makeAddImage(parentEl, name, link){
  
  let clone = parentEl.cloneNode(true);
  if(clone.querySelector('img') !== null){
    parentEl.parentElement.appendChild(clone);
    clone.querySelector('.imagetype').value = name;
    clone.querySelector('img').setAttribute('src', link);
    clone.querySelector('.uploadimage').dataset.value = name;
    attachImageLoadEvent(clone);
    addImageEvent();
		editEvents();
  }else{
    swiftmoAlert.setContent('Please use the first image adder before adding another one.').toggle();
  }
}

/**
  * Reset Images
  * @function resetImages
  * @param {HTMLelement} button -Element on which click is attached.
  * @param {string} type - The type of thing the image upload belongs to
  * ('theme', 'item type', 'produced')
  * @summary Clear field in the image adder, removes all extra image adders.
  * @memberof backendEventDelegation.selectAndEdit
  */
function resetImages(eventTarget, type){
  
  let imgname = eventTarget.closest('.stockModal').querySelector('.imagetype');
      if(!imgname) return;
      imgname.value = '';
      imgname.classList.add('fieldEditableUp');
      imgname.contentEditable = 'true';

  let title = eventTarget.closest('.stockModal').querySelector('.distinctImage').querySelector('.title');
      title.textContent = 'Add images:'

  let extraImageDivs =  eventTarget.closest('.stockModal').querySelectorAll('.distinctImage');
  //Leave first image upload div ∴ a for loop:
  for (var i = 1; i < extraImageDivs.length; i++) {
    extraImageDivs[i].remove();
  }

  eventTarget.closest('.stockModal').querySelector('.editImages')
    .addEventListener('click', (e)=>{
      let themetitle = e.target.closest('.stockModal').querySelector('.title');
      let themename = e.target.closest('.stockModal').querySelector('.itemNewName');
      if(themename.textContent === ''){
        swiftmoAlert.setContent('Enter a name first.').toggle();
        themetitle.textContent = 'images';
      }
      else{
        themetitle.textContent = themename.textContent + ' images';
      }
  });

  let img = eventTarget.parentElement.parentElement.querySelector('.displayImage');

  img.childNodes.forEach((item, i) => {
    img.removeChild(item);
  });

}

/**
  * Reset Item Fields
  * @function resetItemFields
  * @param {HTMLelement} button -Element on which click is attached.
  * @param {string} type - The type of thing the image upload belongs to
  * ('theme', 'item type', 'produced')
  * @summary Clears all the edit fields in the closest stock modal to the
  * event target.
  */
function resetItemFields(eventTarget, type){
  
  eventTarget.closest('.stockModal').querySelectorAll('.edit').forEach((item, i) => {
    item.textContent = '';
  });

  let themename = document.querySelector('#'+type);
      themename.textContent = '';
      themename.classList.add('fieldEditableUp');
      themename.classList.remove('uneditable');
      themename.contentEditable = 'true';
      themename.focus();
}

/**
  * Edit dimensions function
  * @function editDimensions
  * @param {HTMLelement} - The element which was clicked in modal with the
  * dimension fields to be altered.
  * @memberof backendEventDelegation.selectAndEdit
  */
function editDimensions(eventTarget){
  Array.from(eventTarget.closest('.editmodal').querySelectorAll('.dimensions')).forEach((e)=>{
    e.classList.add('fieldEditableUp');
    e.classList.remove('warning');
    e.contentEditable = 'true';
    e.focus();
  });
}

/**
  * Retrieve array like information from html divs
  * @function getArrayTypeInput
  * @param {HTMLelement} - The element which contains the pertinent array fields.
  * @returns {Object[]} -
    An array containing all the values from the HTML elements
    with the '.array' class within the parent element passed to the function.
  */
function getArrayTypeInput(parent, type){
  let arr = [],
      els = parent.querySelectorAll('.array');
  for (var i = 0; i < els.length; i++) {
    if(els[i].textContent.length === 0){
      //do nothing
    }
    else if(isNaN(els[i].textContent)){
      arr.push(els[i].textContent);
    }
    else{
      arr.push(parseInt(els[i].textContent));
    }

    if(i === els.length-1){
      return arr;
    }
  }
}

/**
  * Write Theme Changes -save selectAndEdit changes.
  * @function writeThemeChanges
  * @param {object} object to save.
  * @param {string} type - The type of thing the object represents:
  * ('theme', 'item type', 'produced')
  * @description This function saves an object representing a thing.
  * @memberof backendEventDelegation.selectAndEdit
  * @todo Consider whether this should be split up as a separate function for
  * each type.
  */
function writeThemeChanges(updates, type){
  let select = document.querySelector('#select-'+type),
      option = document.createElement("option"),
      name = updates.name,
      imagedivs = document.querySelector('#editmodal-'+type).querySelectorAll('.distinctImage');

  let dataatr = updates;
      dataatr['image links'] = [];

  if(any(['theme', 'producer'], type)){
    imagedivs.forEach((item, i) => {
      if(item.querySelector('.imageInput').files[0]){
        let imgname = item.querySelector('.imagetype').value;
        let imgext = item.querySelector('.imageInput').files[0].name.split('.')[1];

        dataatr['image links'].push('/images/stock/'+type+'/'+name+'/'+name+'-'+imgname +'.'+imgext);

        if(i === imagedivs.length -1){
          option.dataset.iteminfo = JSON.stringify(dataatr);
          option.value = name;
          option.textContent = name;
          select.appendChild(option);
          option.setAttribute('selected', 'selected');
        }
      }
    });
  }
  if(type === 'item_type'){
    option.dataset.iteminfo = JSON.stringify(dataatr);
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
    option.setAttribute('selected', 'selected');
  }
}

/**
  * Saves or updates a new item
  * @function save
  * @param {object} object to save.
  * @description This function saves an object representing a thing.
  * @memberof backendEventDelegation
  */
function save(saveob){
  xhr(saveob, '/backend/updateItemType', function(res){
    if(res === 'success'){
      //toggle.setinst(document.querySelector('.itemtypesuccess'));
      //toggle.tog(document.querySelector('.itemtypesuccess'), 'block');

      swiftmoAlert.setContent(res).toggle();

      function close(){
        document.querySelectorAll('.arraymodaltype').forEach((item, i) => {
          toggle.tog(item, 'none');
        });
      }
      window.setTimeout(close, 500);
    }
    else{
      modal.document.querySelector('.warning').textContent = 'An error occured';
      modal.document.querySelector('.warning').style.display = 'block';
    }
  });
}




function extractArrayOfText(HTMLnodelist){
	let ar = Array.from(HTMLnodelist);
	let text = [];
	for (let i = 0; i < ar.length; i++) {
		text.push(ar[i].textContent);
		if( i === ar.length-1){
			return text;
		}
	}
}
//gets option values:
function option(){
	let allOptions = [];
	let options = Array.from(document.querySelector('.optionsContainer').querySelectorAll('.optionContainer'));
	for (let i = 0; i < options.length; i++) {
		allOptions.push(
			{
				'option name': options[i].querySelector('.optionName').textContent,
				choices: Array.from(options[i].querySelectorAll('.choice')).map((e)=> e.textContent)
			}
		);
		if(i === options.length -1){
			return allOptions;
		}
	}
}

function addOption(){
	let newOption = document.querySelector('.optionsContainer')
													.querySelectorAll('.optionContainer')[0].cloneNode(true);

	document.querySelector('.optionsContainer').addEventListener('click', eventFN);

	function addAnotherOption(){
		document.querySelector('.optionsContainer').appendChild(newOption);
		document.querySelector('.optionsContainer').addEventListener('click', eventFN);
		editEvents();
	}

	function addAnotherChoice(e){
		let newChoice = e.target.closest('.choiceContainer').firstElementChild.cloneNode(true);
		e.target.closest('.choiceContainer').appendChild(newChoice);
		editEvents();
	}

	function eventFN(e){
			if(e.target.classList.contains('addAnotherOption')){
				addAnotherOption();
			}
			if(e.target.classList.contains('addAnotherChoice')){
				addAnotherChoice(e);
			}

	}
}


/**
  * Save new
  * @function savenew
  * @param {HTMLelement} button which is clicked to save containing itemref.
  * @description Collects and types information to save as a new item.
  * @memberof backendEventDelegation
  * @todo modularize save funciton (same as update, just has a different route)
  */
function savenew(target){
  let saveob = {updates: {
	      theme: JSON.parse(optData($('#select-theme'), 'iteminfo')),
	      'item type': JSON.parse(optData($('#select-item_type'), 'iteminfo')),
	      producer: JSON.parse(optData($('#select-producer'), 'iteminfo')),
	      price: parseInt($('.price').dataset.incent),
	      tax: getInt($('.tax').value),
	      special: $('.special').checked,
	      'linked post': JSON.parse(optData($('#select-blogPost'), 'iteminfo')),
	      description: document.querySelector('#description').textContent,
				'key characteristics': extractArrayOfText(document.querySelectorAll('[data-fieldname="key features-listitem"]')),
				//can't be a template item if it's unique:
	      templateItem: ($('.special').checked) ? false : true,
	      itemref: target.closest('.newitemprofile').dataset.itemref,
				options: option(),
				currency: document.querySelector('#currency').textContent,
    	}
  	}

  xhr(saveob, '/backend/updateItem', function(res){
    if(res === 'success'){
      swiftmoAlert.setContent('Item successfully added').toggle();

      function close(){
        document.querySelectorAll('.arraymodaltype').forEach((item, i) => {
          toggle.tog(item, 'none');
        });
      }
      window.setTimeout(close, 500);
    }
    else{
      modal.document.querySelector('.warning').textContent = 'An error occured';
      modal.document.querySelector('.warning').style.display = 'block';
    }
  });

}

function saveItemEdit(target){
	
	let saveob = {updates: {
				theme: JSON.parse(optData($('#select-theme'), 'iteminfo')),
				'item type': JSON.parse(optData($('#select-item_type'), 'iteminfo')),
				producer: JSON.parse(optData($('#select-producer'), 'iteminfo')),
				price: parseInt($('.price').dataset.incent),
				tax: getInt($('.tax').value),
				special: $('.special').checked,
				'linked post': JSON.parse(optData($('#select-blogPost'), 'iteminfo')),
				description: document.querySelector('#description').textContent,
				'key characteristics': extractArrayOfText(document.querySelectorAll('[data-fieldname="key features-listitem"]')),
				//can't be a template item if it's unique:
				//templateItem: ($('.special').checked) ? false : true,
				itemref: target.closest('.newitemprofile').dataset.itemref,
				options: option(),
				currency: document.querySelector('#currency').textContent,
			},
			itemrefs: JSON.parse(document.querySelector('.editstock').dataset.itemstoedit)
		}

	xhr(saveob, '/backend/saveItemEdit', function(res){
		if(res === 'success'){
			swiftmoAlert.setContent('Item type edited').toggle();

			function close(){
				document.querySelectorAll('.arraymodaltype').forEach((item, i) => {
					toggle.tog(item, 'none');
				});
			}

			function wipe(){
				document.querySelector('.editItemDiv').innerHTML = '';
			}
			window.setTimeout(wipe, 500);
		}
		else{
			modal.document.querySelector('.warning').textContent = 'An error occured';
			modal.document.querySelector('.warning').style.display = 'block';
		}
	});

}

function rightpics(targetField, data){
  
  removepics(targetField, data).then(addpics);
}

function removepics(targetField, data){
  let promise = new Promise((resolve, reject)=>{
    let targets = targetField.querySelectorAll('.distinctImage');

    if(targets.length === 0){
      resolve([data, targetField]);
    }
    else{
      for (let i = 0; i < targets.length; i++) {
        if(i === 0){
          if(targets[i].querySelector('img')){
            targets[i].querySelector('img').remove();
          }
          targets[i].querySelector('.imagetype').value = name;
        }else{
          targets[i].remove();
        }
        if(i === targets.length-1){
          resolve([data, targetField]);
        }
      }
    }

  }); return promise;
}

function addpics(args){
	
  let data = args[0],
      targetField = args[1];
  let promise = new Promise((resolve, reject)=>{
    let images = data['image links'];
    if (images){
      
      for (let i = 0; i < images.length; i++) {
				
				
        let name = images[i].slice(images[i].lastIndexOf('-') +1).split('.')[0];
        
        if(i === 0){
          let img = document.createElement('img');
              img.setAttribute('src', data['image links'][i]);
          targetField.querySelectorAll('.distinctImage')[i].querySelector('.imagetype').value = name;
          targetField.querySelectorAll('.distinctImage')[i].querySelector('.displayImage').appendChild(img);
        }else{
          
          makeAddImage(targetField.querySelectorAll('.distinctImage')[0], name, data['image links'][i], targetField);
        }
        if(i === images.length-1){
          resolve();
        }
      }
    }
  }); return promise;
}

function eventOnAll(classstring, event){
  let targetclass = document.querySelectorAll(classstring);
  for(let i = 0; i < targetclass.length; i++){
    targetclass[i].addEventListener('change', (e)=>{
     event(e, i);
    });
  }
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
//Get human input:
function PercentInput(el){
  el.addEventListener('input', (e)=>{
    //Separate the percent sign from the number:
    let int = e.target.value.slice(0, e.target.value.length - 1);

    /* If there is no number (just the percent sign), rewrite
    it so it persists and move the cursor just before it.*/
    if (int.includes('%')) {
      e.target.value = '%';
    }
    /* If the whole has been written and we are starting the
    fraction rewrite to include the decimal point and percent
    sign. The fraction is a sigle digit. Cursor is moved to
    just ahead of this digit.*/
    else if(int.length >= 3 && int.length <= 4 && !int.includes('.')){
      e.target.value = int.slice(0,2) + '.' + int.slice(2,3) + '%';
      e.target.setSelectionRange(4, 4);
    }
    /* If the we have a double digit fraction we split up, format it
    and print that. Cursor is already in the right place.*/
    else if(int.length >= 5 & int.length <= 6){
      let whole = int.slice(0, 2);
      let fraction = int.slice(3, 5);
      e.target.value = whole + '.' + fraction + '%';
    }
    /* If we're still just writing the whole (first 2 digits), just
    print that with the percent sign. Also if the element has just
    been clicked on we want the cursor before the percent sign.*/
    else {
      e.target.value = int + '%';
      e.target.setSelectionRange(e.target.value.length-1, e.target.value.length-1);
    }
    
  });
};

/* For consuption by robots, the number is best written as an
   interger, so we do that remembering it contains 2 or less
   decimal places*/
function getInt(val){
  //So as not to breakup a potential fraction
  let v = parseFloat(val);
  //If we only have the whole:
  if(v % 1 === 0){
    return v;
  //If the numberis a fraction
  }else{
    let n = v.toString().split('.').join('');
    return parseInt(n);
  }
}
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
function xhr(items, route, callback){
  afirm = false;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', route);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(items));

  if(xhr.readyState === 1){
    document.body.style.pointerEvents = 'none';
  }

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
    if(xhr.status >= 500 && xhr.status < 600){
      callback('An error occurred, please wait a bit and try again.');
    }
    if(xhr.status === 404) {
      callback('404');
    }
  };
}

function formxhr(items, route, callback){
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
      
      //n.b. make errors useful, this is actual error text:
      callback(xhr.responseText);
    }
  };

}

function asyncXHR(route, payload, noparse){
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
