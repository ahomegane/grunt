'use strict'

module.exports = (grunt) ->

  grunt.loadNpmTasks 'assemble'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compass'
  grunt.loadNpmTasks 'grunt-contrib-cssmin'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  # 変更があったファイルのみwatchの対象に。filter: changed_onlyで有効化
  # http://mohayonao.hatenablog.com/entry/2013/03/26/093554
  GRUNT_CHANGED_PATH = '.grunt-changed-file'
  if grunt.file.exists GRUNT_CHANGED_PATH
    changed = grunt.file.read GRUNT_CHANGED_PATH
    grunt.file.delete GRUNT_CHANGED_PATH
    changed_only = (file)-> file is changed
  else
    changed_only = -> true

  grunt.event.on 'watch', (action, filepath, target)->
    console.log filepath
    if action is 'changed'
      grunt.file.write GRUNT_CHANGED_PATH, filepath
    if action is 'deleted'
      grunt.file.delete filepath.replace(/^src\/(.+)$/, 'public/$1').replace(/\.coffee$/, '.js').replace(/\.scss$/, '.css'), { force: true } # ファイルの削除
 
  grunt.initConfig
 
    pkg:
      grunt.file.readJSON 'package.json'

    assemble:
      options: {
        expand: true
        flatten: false
        layoutdir: 'src/_assemble/layout'
        # data: ['src/_assemble/data/**/*.{json,yml}']
        partials: ['src/_assemble/include/**/*.hbs']
      }
      default:
        options: {
          layout: 'default.hbs' 
        }
        expand: true
        cwd: 'src'
        src: ['**/*.html']
        dest: 'public/'

    copy:
      bower:
        expand: true # 中間ディレクトリの作成
        flatten: true
        cwd: '../bower/bower_components/' # srcの固定。destは固定されない
        src: ['html5shiv/dist/html5shiv-printshiv.js', 'underscore/underscore-min.js', 'jquery.cookie/jquery.cookie.js']#'jquery/jquery.min.js', 
        dest: 'src/shared/js/libs'
        filter: 'isFile'
      src:
        expand: true
        flatten: false
        cwd: 'src'
        src: ['**/*.*', '!**/*.html', '!**/*.coffee', '!**/*.scss', '!_assemble/**/*.*']
        dest: 'public/'
        filter: changed_only

    coffee:
      compile:
        expand: true
        flatten: false #src内のディレクトリをキープして出力
        cwd: 'src'
        src: '**/*.coffee'
        dest: 'public/'
        ext: '.js'
        filter: changed_only

    jshint:
      public: [
        'public/**/*.js'
        '!public/**/*.min.js'
      ]

    uglify:
      options:
        mangle: true # true にすると難読化がかかる。false だと関数や変数の名前はそのまま
      shared:
        options: # sourcemap : https://github.com/gruntjs/grunt-contrib-uglify/issues/71
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */' 
        files:
          'public/shared/js/script.min.js': [
            'public/shared/js/libs/jquery.js'
            'public/shared/js/observer.js'
          ]

    # https://github.com/gruntjs/grunt-contrib-compass
    compass:
      src:
        options:
          outputStyle: 'expanded'
          noLineComments: true
          debugInfo: false
          basePath: 'src'
          sassDir: './'
          cssDir: '../public/'
          importPath: 'src/shared/css'

    cssmin:
      src:
        expand: true
        flatten: false
        cwd: 'public/'
        src: ['**/*.css', '!**/*.min.css']
        dest: 'public/'
        ext: '.css'

    # concat:
    #   dist:
    #     files:
    #       'public/shared/css/style.css': [
    #         'public/shared/css/all.css',
    #         'public/shared/css/module.css',
    #         'public/shared/css/theme-responsive.css',
    #         'public/shared/css/theme.css'
    #       ]

    # clean:
    #   dist: [
    #         'public/shared/css/all.css',
    #         'public/shared/css/module.css',
    #         'public/shared/css/theme-responsive.css',
    #         'public/shared/css/theme.css'
    #       ]

    # http://yuzuemon.hatenablog.com/entry/2013/10/15/230642
    # http://www.yoheim.net/blog.php?q=20130409
    # connect:
    #   livereload:
    #     site:
    #       options:
    #         hostname: '*'
    #         port: 8005

    # https://github.com/jrburke/r.js/blob/master/build/example.build.js
    # http://d.hatena.ne.jp/maneater_rhythm/20130219/1361282887
    # http://d.hatena.ne.jp/sinmetal/20130331/1364742840
    # http://d.hatena.ne.jp/monjudoh/20101207/1291719328
    # requirejs:
    #   main:
    #     options:
    #       optimize: 'none'
    #       generateSourceMaps: true
    #       baseUrl: 'public/shared/js'
    #       name: 'common'
    #       mainConfigFile: 'public/shared/js/require-config.js'
    #       out: 'public/shared/js/main.js'

    watch:
      options:
        livereload: true
        nospawn: false      
      assemble:
        files: ['src/**/*.html']
        tasks: ['assemble']
      _assemble:
        files: ['src/_assemble/*.hbs']
        tasks: ['assemble']
      coffee:
        files: ['src/**/*.coffee']
        tasks: ['coffee']
      compass:
        files: ['src/**/*.scss']
        tasks: ['compass']       
      other:
        files: ['src/**/*.*', '!src/**/*.html', '!src/**/*.coffee', '!src/**/*.scss', '!src/_assemble/**/*.*']
        tasks: ['copy:src']

  grunt.registerTask 'init', ['copy:bower']
  grunt.registerTask 'update', ['compass' , 'coffee', 'copy:src', 'assemble']
  grunt.registerTask 'default', ['watch']
  grunt.registerTask 'lint', ['jshint']
  grunt.registerTask 'build', ['uglify', 'cssmin']
