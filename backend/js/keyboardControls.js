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
