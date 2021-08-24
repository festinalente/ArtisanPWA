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
