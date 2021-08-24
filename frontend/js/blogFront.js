document.querySelectorAll('.fetchpost').forEach(function(e){
  e.addEventListener('click', function(evt){
    var link = evt.target.parentElement.dataset.title;
    window.location.pathname = '/blog/' + link;
  });
});
