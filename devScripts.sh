#!/bin/sh
buildOnAlter(){
  npm run scssCompile &
  grunt scssCompile &
  grunt scssCompile &
  grunt insertEnvVar;
}

startUpDev(){
  npm run scss &
  npm run scss1 &
  grunt watch &
  NODE_ENV="development"
  node startapp.js;
}
