function xhr(items, route, callback){
  afirm = false;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', route);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(items));

  if(xhr.readyState === 1){
    document.body.style.pointerEvents = 'none';
  }

  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      if(xhr.responseText){
        callback(xhr.responseText);
        document.body.style.pointerEvents = '';
        //document.querySelector('.loadingGif').style.display = 'none';
      }
    }
  };
}

function xhrget(items, route, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', route);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.timeout = 1000;
  xhr.send(encodeURI(items));
  xhr.ontimeout = function(e){
    callback('404');
  };
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr.responseText);
    }
    if(xhr.status >= 500 && xhr.status < 600){
      callback('An error occurred, please wait a bit and try again.');
    }
    if(xhr.status === 404) {
      callback('404');
    }
  };
}

function formxhr(items, route, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', route);
  //xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //xhr.setRequestHeader('Content-Type','multipart/form-data');
  xhr.send(items);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr.responseText);
    }
    if(xhr.readyState === 4 && xhr.status === 500){
      
      //n.b. make errors useful, this is actual error text:
      callback(xhr.responseText);
    }
  };

}

function asyncXHR(route, payload, noparse){
	return new Promise(resolve => {
		xhr(payload, route, function callback(reply){
      if(noparse === "noparse"){
        resolve(reply);
      }
      else{
        var parsed = JSON.parse(reply);
        resolve(parsed);
      }
		});
	});
}
