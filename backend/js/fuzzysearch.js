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
