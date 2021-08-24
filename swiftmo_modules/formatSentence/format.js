exports.format = function formatSentence(ar){
  let formattedSentence = '';
  for (let i = 0; i < ar.length; i++) {
    if(i === 0){
      formattedSentence += ar[i].charAt(0).toUpperCase() + ar[i].slice(1);
    }
    else if(i === ar.length-1){
      formattedSentence += ' and ' + ar[i];
    }else{
      formattedSentence += ', ' + ar[i];
    }
    if(i === ar.length -1){
      return formattedSentence;
    }
  }
}
