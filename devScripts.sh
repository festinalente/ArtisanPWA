#!/bin/sh
buildOnAlter(){
  npm run scssCompile &
  echo "Ran npm scssCompile" &
  grunt scssCompile &
  echo "Ran grunt scssCompile" &
  grunt minifyCSS &
  echo "Ran grunt minify" &
  grunt insertEnvVar &
  echo "Inserted variable from .env";
}

startUpDev(){
  npm run scss &
  npm run scss1 &
  grunt watch &
  NODE_ENV="development" &
  node startapp.js;
}
