

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
