
  if(!!window.IntersectionObserver){
  	let observer = new IntersectionObserver((entries, observer) => {
  		entries.forEach(entry => {
        if(!entry.target.nextSibling.classList){
          console.warn(entry.target);
          console.warn('has no nextSibling');
        }
  		if(entry.isIntersecting){
        entry.target.classList.add('background0');
        entry.target.classList.remove('background1');
        entry.target.nextSibling.classList.add('moveText');
  		}else{
        entry.target.classList.add('background1');
        entry.target.classList.remove('background0');
        entry.target.nextSibling.classList.remove('moveText');
      }
  		});
  	}, {rootMargin: "0px 0px -80% 0px"});

  	document.querySelectorAll('.overlay1').forEach(el => { observer.observe(el) });
  }
