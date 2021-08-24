const sharp = require('sharp');
const fs = require('fs');

exports.makeItemPicture = (imgLocation, imgname, ext)=>{
  const source = imgLocation + imgname;
  // + '.jpg';
  const destfile = imgLocation.replace('unoptimized', 'optimized') + imgname.split('.')[0] + '.webp';

  let promise = new Promise((resolve, reject)=>{
    fs.open(destfile, 'w', (err, dest)=>{
      if(err) console.warn(err);
      sharp(source)
        .resize({width: 560})
        .toFormat('webp')
        .webp({quality: 100})
        .toFile(destfile)
        .then((e)=>{
          resolve();
        })
        .catch( err => { reject(err)});
    });
  });
  return promise;
};

exports.makePlaceHolderPicture = (imgLocation, imgname, ext)=>{
  const source = imgLocation + imgname;
  // + '.jpg';
  const destfile = imgLocation + imgname.split('.')[0] + '.webp';

  let promise = new Promise((resolve, reject)=>{
    fs.open(destfile, 'w', (err, dest)=>{
      if(err) console.warn(err);
      sharp(source)
        .resize({width: 560})
        .toFormat('webp')
        .webp({quality: 100})
        .toFile(destfile)
        .then((e)=>{
          resolve();
        })
        .catch( err => { reject(err)});
    });
  });
  return promise;
};
