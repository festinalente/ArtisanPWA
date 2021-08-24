

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
