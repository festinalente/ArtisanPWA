/**
 * Serializes a Request into a plain JS object.
 *
 * @param request
 * @returns Promise
 */
function serializeRequest(request) {
	  var serialized = {
		url: request.url,
		headers: serializeHeaders(request.headers),
		method: request.method,
		mode: request.mode,
		credentials: request.credentials,
		cache: request.cache,
		redirect: request.redirect,
		referrer: request.referrer
	  };

	  // Only if method is not `GET` or `HEAD` is the request allowed to have body.
	  if (request.method !== 'GET' && request.method !== 'HEAD') {
		return request.clone().text().then(function(body) {
		  serialized.body = body;
		  return Promise.resolve(serialized);
		});
	  }
	  return Promise.resolve(serialized);
}

/**
 * Serializes a Response into a plain JS object
 *
 * @param response
 * @returns Promise
 */
function serializeResponse(response) {
	  var serialized = {
		headers: serializeHeaders(response.headers),
		status: response.status,
		statusText: response.statusText
	  };

	  return response.clone().text().then(function(body) {
		  serialized.body = body;
		  return Promise.resolve(serialized);
	  });
}

/**
 * Serializes headers into a plain JS object
 *
 * @param headers
 * @returns object
 */
function serializeHeaders(headers) {
	var serialized = {};
	// `for(... of ...)` is ES6 notation but current browsers supporting SW, support this
	// notation as well and this is the only way of retrieving all the headers.
	for (var entry of headers.entries()) {
		serialized[entry[0]] = entry[1];
	}

	return serialized;
}

/**
 * Creates a Response from it's serialized version
 *
 * @param data
 * @returns Promise
 */
function deserializeResponse(data) {
	return Promise.resolve(new Response(data.body, data));
}

/**
 * Saves the response for the given request eventually overriding the previous version
 *
 * @param data
 * @returns Promise
 */
function cachePut(request, response, store) {

	var key, data;
	getPostId(request.clone())
	.then(function(id){

		key = request.referrer;
		return serializeResponse(response.clone());
	}).then(function(serializedResponse) {
		data = serializedResponse;
		var entry = {
			key: key,
			response: data,
			timestamp: Date.now()
		};

		store
		.add(entry)
		.catch(function(error){
			store.update(entry.key, entry);
		});
	});
}

/**
 * Returns the cached response for the given request or an empty 503-response  for a cache miss.
 *
 * @param request
 * @return Promise
 */
function cacheMatch(request, store) {
	
	return getPostId(request.clone())
	.then(function(id) {
		
		return store.get(id);
	}).then(function(data){
		if (data) {
			return deserializeResponse(data.response);
		} else {
			return new Response('', {status: 503, statusText: 'Service Unavailable'});
		}
	});
}

/**
 * Returns a string identifier for our POST request.
 *
 * @param request
 * @return string
 */
function getPostId(request) {
	
  let promise = new Promise((resolve, reject)=>{
    resolve(JSON.stringify(serializeRequest(request.clone())));
  });
  return promise;
}

function any(testsubjects, keyvalue){
  return testsubjects.includes(keyvalue);
}
