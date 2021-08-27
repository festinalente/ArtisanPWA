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
    let count = e.target.parentElement.querySelector('.numberInput').value;
    if(count < 2){
      swiftmoAlert.setContent(`You need at least one item in stock to index it`).toggle();
    }
    
    xhr({itemref: itemref, count: count}, '/backend/indexItem', function callback(response){
      if(response === 'OK'){
        let countdisplay = e.target.parentElement.querySelector('.countval');
        countdisplay.textContent = parseInt(countdisplay.textContent) + parseInt(count);
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
