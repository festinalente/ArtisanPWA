//the fourth parameter *classes* takes an array of class names without the dot, e.g.
//['backendh4']

(function scopeItIn(){
  var nodeFamily = [];
    domadd = {
      append: function(NodeType, Content, Parent, Classes, Id, Attributes, Nest){
        var el = document.createElement(NodeType);

        if(Content){
          el.textContent = Content;
        }

        if(Classes){
          Classes.forEach(function(c) {
            el.classList.add(c);
          });
        }

        if(Id){
          el.id = Id;
        }
        //attributes takes an array of objects with value key equating to attr and val
        //6th argument
        if(Attributes){
          Attributes.forEach(function(a, count) {
            el.setAttribute(Object.keys(a)[0], a[Object.keys(a)[0]]);
          });
        }
        if(Parent instanceof Element || Parent  instanceof HTMLDocument){
          Parent.append(el);
        }
        else if(Parent === 'ChildOfPrev'){
          nodeFamily[nodeFamily.length-1].append(el);
        }
        else{
          document.querySelector(Parent).append(el);
        }

        nodeFamily.push(el);

        return this;
      }
    };
      return domadd;
  }
)();
