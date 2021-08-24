const imageAPI = (function imageAPI(){
	let canvas;
	let ctx;
	let input;
	let imgStore = [];

	return obj = {
			setUpCanvas :
				function setUpCanvas(a, b, c){
					
					
					
					canvas = document.querySelector(a);
					ctx = canvas.getContext(b);
					input = document.querySelector(c);
					//document.querySelector('input[type=file]');
					input.onchange = function () {
					  var file = input.files[0];
						obj.drawOnCanvas(file, ctx, canvas);
					};
					return this;
				},
			drawOnCanvas :
				function drawOnCanvas(file, ctx, canvas){
					let reader = new FileReader();
				  reader.onload = function (e) {
				    let dataURL = e.target.result;
						let img = new Image();
				    img.onload = function() {
				      //canvas.width = img.width;
				      //canvas.height = img.height;
				      ctx.drawImage(img, 0, 0, img.width, img.height,     // source rectangle
				                   0, 0, canvas.width, canvas.width * (img.width /img.height)); // destination rectangle;
				    };
				    img.src = dataURL;
				  };
					obj.displayTitle(canvas);
					
				  reader.readAsDataURL(file);
					//obj.saveImage(canvas);

					return this;
				},
			displayTitle : function(canvas){
				if(canvas.previousSibling.tagName ='P'){
					canvas.previousSibling.textContent = 'New item image:';
				}
				return this;
			},
			saveImage :
				/*This is a bit ugly, currentNewItem is a global that keeps getting changed,
				  so as to 'capture' it's state at save along with the image we're passing
					it to saveImage(). Note that currentNewItem as it exists in the global
					scope might well be different */
				function saveImage(canvas, currentNewItem, callback){
					//let file = canvas.toDataURL();
					if(canvas){
						let form = new FormData();
							for ( var key in currentNewItem ) {
							  form.append(key, currentNewItem[key]);
							}
							form.append("image", input.files[0]);
							
						formxhr(form, '/backend/saveitemimage', function callback(response){
							callback(response);
						});
					}
					return this;
				},
			loadImageToCanvas :
				function loadCanvas(dataURL, canvas, context) {
					let reader = new FileReader();
					reader.onload = function(event){
						let img = new Image();
					  img.onload = function() {
					    canvas.width = img2.width;
					    canvas.height = img2.height;
					    imgheight = img2.height;
					    imgwidth = img2.width;
					    ctx.drawImage(this, 0, 0, imgwidth, imgheight);
						}
						img.src = event.target.result;
					}
					reader.readAsDataURL(e.target.files[0]);
					return this;
				}
		};
})();
