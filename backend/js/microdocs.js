document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('question')){
    e.target.nextSibling.classList.add('infodisplay');
    e.target.nextSibling.querySelector('.circle').addEventListener('click', (el)=>{
      e.target.nextSibling.classList.remove('infodisplay');
    })
  }
});
