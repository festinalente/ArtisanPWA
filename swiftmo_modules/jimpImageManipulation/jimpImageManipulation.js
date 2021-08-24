const Jimp = require('jimp')
exports.makeRentalPicture = function makeRentalPicture(filepath, success){
  // open a file called "lenna.png"
  
  Jimp.read(filepath, (err, lenna) => {
      if (err){
        throw (err);
      }
      else{
        lenna
          .resize(800, Jimp.AUTO) // resize
          .quality(60) // set JPEG quality
          .write(filepath); // save
        success(1);
      }
  });
};

exports.makeStandardPicture = function uploadimgL(filepath, success){
  Jimp.read(filepath, (err, lenna) => {
      if (err){
        throw (err);
      }
      else{
        lenna
          .resize(1200, Jimp.AUTO) // resize
          .contain(1200, 800)
          .quality(70) // set JPEG quality
          .write(filepath); // save
        success(1);
      }
  });
};

exports.holidayScrollerPic = function uploadimgL(filepath, success){
  Jimp.read(filepath, (err, lenna) => {
      if (err){
        throw (err);
      }
      else{
        lenna
          .resize(1200, Jimp.AUTO) // resize
          .contain(1200, 800)
          .quality(70) // set JPEG quality
          .write(filepath); // save
        success(1);
      }
  });
};
