/*jshint esversion: 6 */
const express = require('express');
const blog = express.Router();
const mongo = swiftMod('mongo');
const reqVal = swiftMod('reqValidator').reqVal;
//const makejsonld = swiftMod('makeJSONLD').holiday;
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

blog.use(function (req, res, next) {
  try{
    (async ()=>{
      let ent = await mongo.entityDetails();
      res.locals.entityDetails = ent;
      //res.locals.nonce = uuidv4();
      next();
    })();
  }
  catch(err){
    console.warn(err);
  }
});

blog.get('*', function(req,res){

  let pathQuery = decodeURI(req.path);


  if(pathQuery === '/'){
    mongo.getBlogsViaQuery({}).then((result)=>{
      if(result){
        res.render('./blog/blog.pug', {data: result, entity: res.locals.entityDetails});
      }else{
        let error = new Error('No Posts for' + req);
        throw error;
      }
    }).catch((error)=>{
      res.render('./blog/blog.pug', {data: {title: 'Error fetching blogs', entity: res.locals.entityDetails}});
    });
  }

  else{
    mongo.getTopics().then((topics)=>{
      let sliceSlash = pathQuery.slice(1, pathQuery.length);
      //render topic:
      if(topics.includes(sliceSlash)){
        mongo.getBlogsViaQuery({topics: sliceSlash}).then((data)=>{
          res.render('./blog/topic.pug', {data : data, entity: res.locals.entityDetails});
        });
      }
      //render post:
      else{

        try {
          (async ()=>{
            let getPost = await mongo.getBlogs(pathQuery);
            let title = pathQuery.slice(1, pathQuery.length);
            let linkedItems = await mongo.queryStock({'linked post.title': title});

            if(getPost){
              res.render('./blog/postView.pug', {post : getPost, entity: res.locals.entityDetails, stock: linkedItems});
            }
            else{
              let error = new Error('No Posts for ' + pathQuery);
              throw error;
            }
          })();
        }
        catch (e) {
          res.render('./404.pug', {entity: res.locals.entityDetails});
        }

      }

    });

  }

});

module.exports = blog;
