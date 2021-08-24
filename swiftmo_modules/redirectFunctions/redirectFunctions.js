const mongo = swiftMod('mongo');

function getArrayName(name){
  let promise = new Promise((resolve, reject)=>{
    let clearChars = name.replace(/[-&_',]/g, ' ');
    //get rid of extra white spaces
    let replaceMultipleSpaces = clearChars.replace(/([ ]{2,})/g, ' ');
    //to lowercase:
    let lowercase = replaceMultipleSpaces.toLowerCase();
    //split into array
    let ar = lowercase.split(' ').sort();

    resolve(ar);
  });
  return promise;
}

function getThemeNames(){
  let promise = new Promise((resolve, reject)=>{
    (async ()=>{
      let themeNamesFormated = [];
      let themeNamesIndex = [];
      let themes = await mongo.getAllThemes();

      for (var i = 0; i < themes[0].theme.length; i++) {
        themeNamesFormated.push(getArrayName(themes[0].theme[i].name));
        themeNamesIndex.push(themes[0].theme[i].name);
        if(i === themes[0].theme.length-1){
          let formated = Promise.all(themeNamesFormated).then((final)=>{
            resolve({sortedArray: final, index: themeNamesIndex});
          });
        }
      }
    })();
  });
  return promise;
}

module.exports = {getArrayName, getThemeNames};
