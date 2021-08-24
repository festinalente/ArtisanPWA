exports.fromTimeStamp = function fromTimeStamp(timestamp){
  let date = new Date(timestamp);
  let formated = date.getFullYear() + '-' +
  (date.getMonth() + 1) + '-' +
  date.getDate() + ' (YYYY-MM-DD)';
  return formated;
};
