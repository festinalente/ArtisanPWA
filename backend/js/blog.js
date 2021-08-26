// TODO: Requires maintenance function to delete images if no blog post exits.

function makeBlog(query){
  xhr(query, '/backend/blog', function callback(message){
    let maincontent = document.querySelector('.maincontent');
        maincontent.innerHTML = message;
        makeControls();
    let postcontent = document.querySelector('.postcontent');
    let postList = document.querySelector('.postList');
    //@ param querySelector for drop target:
    eventOnAll('.topics', ()=> activateDropDown.setState('topicsfilter').hideOrDisplay());
    events();
    /**
     *
     */

    function events(){
      postList.querySelectorAll('.deletepost').forEach(function(el){
        el.addEventListener('click', function(e){
          e.stopPropagation();
          xhr({_id: e.target.parentElement.dataset.id, title: e.target.parentElement.dataset.title}, '/backend/blogdelete', function(res){
            postList.removeChild(e.target.parentElement);
          });
        });
      });

      postcontent.querySelector('.blogVideo').addEventListener('input', saveVideo);

      function saveVideo(e){
        //upload button:
        e.target.nextSibling.addEventListener('click', function(e){
          e.preventDefault();
          let time = new Date(),
              mill = time.getTime(),
              videodata = {
                timestamp: mill,
                _id: document.querySelector('.postcontent').querySelector('.postview').dataset._id,
                title: document.querySelector('.title').value,
                video: document.querySelector('.blogVideo').files[0]
              },
              form = new FormData(),
              keys = Object.keys(videodata),
              values = Object.values(videodata);

          keys.forEach(function(e, i){
            form.append(keys[i], values[i]);
          });

          formxhr(form, '/backend/saveblogvideo', function callback(response){
            let responseParsed = JSON.parse(response);

            if(responseParsed.error){
              swiftmoAlert.setContent(responseParsed.error).toggle();
            }
            else{
              let container = document.createElement('div');
                  container.style.display = 'flex';
              let video = document.createElement('video');
                  video.setAttribute('src', responseParsed.link);
                  video.setAttribute('autoplay', true);
                  video.style.maxWidth = '100%'

              container.appendChild(video);
              makeButton(container, 'deleteButton', 'x', 'delete', deleteVideo);
              makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
              makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);

              document.querySelector('.content').appendChild(container);

              swiftmoAlert.setContent(responseParsed.message).toggle();
              video.scrollIntoView(true);
            }
          });
        });
      }


      let hasClick = 0;

      postcontent.querySelector('.blogImage').addEventListener('input', saveImage);

    function saveImage(event){

      //attach the event to upload button
      if(hasClick === 0){
        event.target.nextSibling.addEventListener('click', function(e){
        hasClick = 1;
        e.preventDefault();

        let id = document.querySelector('.postcontent').querySelector('.postview').dataset._id;

        let time = new Date(),
            mill = time.getTime(),
            imgdata = {
              //itemref: parent.dataset.itemref,
              timestamp: mill,
              _id: document.querySelector('.postcontent').querySelector('.postview').dataset._id,
              title: document.querySelector('.title').value,
              image: document.querySelector('.blogImage').files[0]
            },
            form = new FormData(),
            keys = Object.keys(imgdata),
            values = Object.values(imgdata);
        keys.forEach(function(e, i){
          form.append(keys[i], values[i]);
        });
        formxhr(form, '/backend/saveblogimage', function callback(response){
          let responseParsed = JSON.parse(response);
          if(responseParsed.error){
            swiftmoAlert.setContent(responseParsed.error).toggle();
          }
          else{
            /*if(responseParsed.message === 'Image saved'){
              parent.querySelector(imgInputDiv+'ImgDiv').firstChild.src = responseParsed.link;
            }*/
            let container = document.createElement('div');
                container.style.display = 'flex';
            let img = document.createElement('img');
                img.setAttribute('src', responseParsed.link);
                img.style.maxWidth = '100%'

            container.appendChild(img);
            makeButton(container, 'deleteButton', 'x', 'delete', deleteImage);
            makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
            makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);

            document.querySelector('.content').appendChild(container);

            swiftmoAlert.setContent(responseParsed.message).toggle();
            img.scrollIntoView(true);
          }
        });
      });
      }
    }

    postList.querySelectorAll('.fetchpost').forEach((e)=>{
      e.addEventListener('click', (e)=>{
        xhr({	_id: e.target.parentElement.dataset.id,
          provider: document.getElementById('profile').dataset.provider
        },
        '/backend/blogjson', function callback(message){
          let post = JSON.parse(message).data[0];
          document.querySelector('.title').value = (post && post.title) ? post.title : 'enter a tile';
          document.querySelector('.topicInput').value = (post && post.topics) ? post.topics.toString() : 'enter topics';

          while (document.querySelector('.content').firstChild) {
            document.querySelector('.content').removeChild(document.querySelector('.content').firstChild);
          }
          if(post && post.content){
            post.content.forEach((e)=>{
              makeEditableTextField(e.el, e.cont, '.content');
            });
            document.querySelector('.postdescription').value = post.description;
          }
          if(post && post._id){
            document.querySelector('.postcontent').querySelector('.postview').dataset._id = post._id;
          }
          makeControls();
          document.querySelector('.content').scrollIntoView({block: 'start',  behavior: 'smooth' });
        });
      });
    });
  }

  function makeControls(){
    if(document.querySelector('.controls').firstChild){
      return;
    }
    let elementtypes = ['p', 'em', 'b', 'h1', 'h2', 'h3', 'h4', 'figcaption', 'quotation'];
    let plebNames = ['paragraph',
    'italic text',
    'bold text',
    'h1, main title',
    'h2, sub title',
    'h3, sub sub title',
    'h4, minor title',
    'figcaption, image caption', 'quotation']
    elementtypes.forEach((e, index)=>{
      let b = document.createElement('button');
      b.classList.add('btnbackend', 'uniformdisplay', 'bounceOnHover')
      let eltype = document.createElement(e);
      eltype.textContent = 'Add ' + plebNames[index];
      b.appendChild(eltype);
      document.querySelector('.controls').appendChild(b);

      b.addEventListener('click', function(event){
        event.preventDefault();
        makeEditableTextField(e, null, '.content');
      });
    });
  }


  function makeListItem(id, topics, title){
    let newLi = document.createElement('li');
        newLi.dataset._id = id;
        newLi.dataset.topics = topics;
        newLi.dataset.topics = title;
        newLi.textContent = title;
    let fetch = document.createElement('span');
        fetch.classList.add('bounceOnHover', 'btngreen', 'fetchpost');
        fetch.textContent = 'fetch';
    let del = document.createElement('span');
        del.classList.add('bounceOnHover', 'btnwarn', 'deletepost');
        del.textContent = 'delete';
    newLi.appendChild(fetch);
    newLi.appendChild(del);
    postList.appendChild(newLi);
    events();
  }



  /**
  * 	@param string a html element type
  */
  function makeEditableTextField(elementType, textContent, parentElement){
    let container = document.createElement('div');
    container.style.display = 'flex';
    let el = document.createElement(elementType);

    if(!any(['img', 'video'], elementType)){
      el.setAttribute('contentEditable', true);
      el.classList.add('fieldEditable', 'fieldEditableUp');
      el.textContent = textContent || 'Your text';
      container.appendChild(el);
      document.querySelector(parentElement).appendChild(container);
      makeButton(container, 'deleteButton', 'x', 'delete', deleteParagraph);
      makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
      makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);
    }else if(elementType === 'img'){
      let cleanURL = (textContent.includes('http://localhost:8080')) ? textContent.replace('http://localhost:8080', '.') : textContent;
      el.setAttribute('src', cleanURL);
      container.appendChild(el);
      document.querySelector(parentElement).appendChild(container);
      makeButton(container, 'deleteButton', 'x', 'delete', deleteImage);
      makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
      makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);
    }else if(elementType === 'video'){
      let cleanURL = (textContent.includes('http://localhost:8080')) ? textContent.replace('http://localhost:8080', '.') : textContent;
      el.setAttribute('src', cleanURL);
      el.setAttribute('controls', true);
      el.setAttribute('autoplay', true);
      container.appendChild(el);
      document.querySelector(parentElement).appendChild(container);
      makeButton(container, 'deleteButton', 'x', 'delete', deleteVideo);
      makeButton(container, 'moveUpButton', '\u21E7', 'move up', moveUp);
      makeButton(container, 'moveDownButton', '\u21E9', 'move down', moveDown);
    }


    selectElementContents(el);
  }

  function deleteParagraph(e){
    document.querySelector('.content').removeChild(e.target.parentElement);
  }

 function deleteImage(e){

    let url = e.target.previousSibling.src;
    let base = window.location.origin;
    var regex = new RegExp(base,"gi");
    ///base/gi;

    let q = {
      image: url.replace(regex, ''),
      _id: document.querySelector('.title').dataset.id,
      title: document.querySelector('.title').value
    };

    xhr(q, '/backend/blogimagedelete', function(cb){
      document.querySelector('.content').removeChild(e.target.parentElement);
      let cbp = JSON.parse(cb);

      if(cbp.error){
        swiftmoAlert.setContent(cbp.error).toggle();
      }else{
        swiftmoAlert.setContent(cbp.success).toggle();
      }
    });
  }

  //same as delete image:
  function deleteVideo(e){
    let url = e.target.previousSibling.src;
    let base = window.location.origin;
    var regex = new RegExp(base,"gi");
    ///base/gi;
    let q = {
      video: url.replace(regex, ''),
      _id: document.querySelector('.title').dataset.id,
      title: document.querySelector('.title').value
    };

    xhr(q, '/backend/blogvideodelete', function(cb){
      document.querySelector('.content').removeChild(e.target.parentElement);
      let cbp = JSON.parse(cb);

      if(cbp.error){
        swiftmoAlert.setContent(cbp.error).toggle();
      }else{
        swiftmoAlert.setContent(cbp.success).toggle();
      }
    });
  }

  function moveUp(e){
    let toMove = e.target.parentElement;
    document.querySelector('.content').insertBefore(toMove, toMove.previousSibling);
  }

  function moveDown(e){
    let toMove = e.target.parentElement;
    document.querySelector('.content').insertBefore(toMove, toMove.nextSibling.nextSibling);
  }


  swiftmoAlert.set();

  let fetchnew = document.createElement('button');
  fetchnew.classList.add('btnbackend', 'bounceOnHover', 'fetchnew');
  fetchnew.textContent = 'Add new blog post';
  fetchnew.addEventListener('click', function(){
    xhr({}, '/backend/blognew', function(res){
      document.querySelector('.postedit').innerHTML = res;
      makeControls();
      events();
    });
  });
  document.querySelector('.controlbuttonsnew').appendChild(fetchnew);

  let btn = document.createElement('button');
      btn.classList.add('btngreen', 'bounceOnHover', 'savepost');
      btn.textContent = 'save';

  btn.addEventListener('click', function(e){
    e.preventDefault();
    let id =  document.querySelector('.title').dataset.id,
        title =  document.querySelector('.title').value,
        topics = document.querySelector('.topicInput').value,
        description = document.querySelector('.postdescription').value;

    let content = [];

    Array.from(document.querySelector('.content').children).forEach((e)=>{
      let element = e.firstChild;
      if(any(['IMG', 'VIDEO'], element.tagName)){
        content.push({el: element.tagName.toLowerCase(), cont: element.src});


      }
      else{
        content.push({el: element.tagName.toLowerCase(), cont: element.textContent});

      }
    });

    let post = {
      _id: id,
      title: title,
      topics: topics,
      description: description,
      content: content,
    };

    if(typeof document.querySelector('.title').dataset.id === 'undefined'){
      xhr(post, '/backend/blogsavenew', function(success){
        success = JSON.parse(success);
        if(success.error){
          swiftmoAlert.setContent(success.error).toggle();
        }else{
          swiftmoAlert.setContent('Post saved').toggle();
          document.querySelector('.title').dataset.id = success._id;
          makeListItem(success._id, topics, title);
        }
      });
    }else{
      xhr(post, '/backend/blogsave', function(success){
        if(JSON.stringify(success).error){
          swiftmoAlert.setContent(success.error).toggle();
        }else{
          swiftmoAlert.setContent('Post saved').toggle();
        }
      });
    }
  });

  document.querySelector('.controlbuttonssave').appendChild(btn);

});

}


let activateDropDown = (function(){
	let dropdownState = {},
 			allTargetNodes,
 			selection;

	 return {
		setState : function(dropdownName){

			//e.g. bike profifle .itemType
			//e.g. #itemType
			let dropdown = document.getElementById(dropdownName);
			//whatever is selected, values will always match
			selection = dropdown.options[dropdown.selectedIndex].dataset.attribute;

			dropdownState[dropdownName] = selection;

			return this;
		},
		hideOrDisplay : function(){
			let keys = Object.values(dropdownState);
			let allTargetNodes = document.querySelectorAll('.itemprofile');

			allTargetNodes.forEach(function(node){
				let rank = 0;
				let nodeDataset = Object.values(node.dataset);

				keys.forEach(function(e,index){
					if(nodeDataset.includes(e) || e === undefined){
						//undefined refers to 'ignore this aspect'
						rank++;
					}
					else{
						//rank = false;
					}
					if(index === keys.length-1){
						if(rank === keys.length){


							//test if table or div
							if(document.querySelectorAll('.itemprofile')[0].tagName === 'DIV'){
								node.style.display = 'block';
							}
							else{
								node.style.display = 'table-cell';
							}
						}
						else{
							node.style.display = 'none';
						}
					}
				});
			});
		}
	}
})();
