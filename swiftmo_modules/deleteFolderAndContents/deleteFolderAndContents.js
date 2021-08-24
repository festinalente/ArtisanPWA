/*Used to go through a foler recursively with FS, this seems better for now*/
const fs = require('fs-extra');
exports.deleteFolderAndContents = function deleteFolderAndContents(folderpath){
  let promise = new Promise((resolve, reject)=>{
    fs.remove(folderpath, function(err, success){
      if(err) reject(err);
      resolve('success');
    });
  });
  return promise;
};


function error(err, callback){
  console.warn(err);
  callback("an error occured and the image files either didn\'t exist or couldn't be deleted");
  return;
}
