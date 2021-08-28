require('dotenv').config();
module.exports = function(grunt) {

  let compressionOptionsUglify = {
    sequences: true,
    dead_code: true,
    conditionals: true,
    booleans: true,
    unused: true,

    //if_return: true,
    join_vars: true,
    drop_console: false
  };

  grunt.registerTask('insertEnvVar', ['replace']);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    /*****CONCAT*****/
    concat: {
        scriptsBack: {
          options: {separator: ''},
          src: ['backend/js/*.js'],
          dest: 'backend/productionJS/backendmaster.js'
        },
        sw: {
          options: {separator: ''},
          src: ['static/frontendPWA/swFunctions.js', 'static/frontendPWA/swEvents.js'],
          dest: 'static/frontendPWA/production/sw.js'
        },
        scriptsFront: {
          options: {separator: ''},
          //'/frontendPWA/pwa.js'
          src: ['frontend/js/**/*.js'],
          dest: 'frontend/productionJS/master.js'
        },
        stylesFront: {
          options: {separator: ''},
          /*          src: ['static/css/*.css','static/css/atMedia/*.css','static/css/sassDerived/*.css'],*/
          src: ['frontend/css/*.css','frontend/css/sassDerived/*.css'],
          dest: 'frontend/css/production/master.css'
        },
        stylesBack: {
          options: {separator: ''},
          src: ['backend/css/sassDerived/*.css', 'static/css/bootstrapGlyphiconsWeveKept.css'],
          dest: 'backend/css/production/master.css'
        }
    },
    /*****MINIFY******/
    terser: {
      js: {
        options: {
          compress: compressionOptionsUglify,
        },
        files: {'frontend/productionJS/master.min.js': ['frontend/js/**/*.js', 'static/frontendPWA/pwa.js']}
      },
      sw: {
        options: {
          compress: compressionOptionsUglify,
        },
        files: {'static/production/js/sw.min.js': ['static/frontendPWA/production/sw.js']}
      },
      backendjs: {
        options: {
          compress: compressionOptionsUglify,
        },
        files: {'backend/productionJS/backendmaster.min.js': ['backend/js/*.js']}
      },
    },

    cssmin: {
      mastercss: {
        files: {'frontend/css/production/master.min.css': ['frontend/css/production/master.css']}
      },
      backendcss: {
        files: {'backend/css/production/master.min.css': ['backend/css/production/master.css']}
      }
    },

    /*jsdoc*/
    jsdoc : {
        dist : {
            src: [
              'static/js/*.js',
              'backend/js/*.js',
              'backend/SwiftCal/SwiftCal/js/*.js',
              'swiftmo_modules/*/*.js',
              'router/*.js',
              '!backend/js/dexie.js'],
            options: {
              destination: 'static/documentation',
              template : "node_modules/ink-docstrap/template",
              configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
            }
        }
    },

    watch: {
      globalScripts: {
        files: ['frontend/js/**/*.js', 'static/frontendPWA/pwa.js'],
        tasks: ['concat:scriptsFront', 'terser:js']
      },
      sw: {
        files: ['static/frontendPWA/swFunctions.js', 'static/frontendPWA/swEvents.js'],
        tasks: ['concat:sw', 'terser:sw']
      },
      backend: {
        files: ['backend/js/*.js'],
        tasks: ['concat:scriptsBack', 'terser:backendjs']
      },
      globalCSS: {
        files: ['frontend/css/*.css', 'frontend/scss/*.scss'],
        tasks: ['concat:stylesFront','cssmin:mastercss']
      },
      backendCSS: {
        files: ['backend/scss/*.scss'],
        tasks: ['concat:stylesBack','cssmin:backendcss']
    },
  },

    replace: {

       dist: {
         options: {
           patterns: [
             {
               match: 'stripeTokenPublic',
               replacement: process.env.stripeTokenPublic
             }
           ]
         },
         files: [
           {
             expand: true, flatten: true, src: ['frontend/productionJS/master.min.js'], dest: 'frontend/productionJSwVar'
           }
         ]
       }
     },

})

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-terser');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-replace');
};
