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
