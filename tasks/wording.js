/*
 * grunt-wording
 * https://github.com/pix/grunt-contrib-wording
 *
 * Copyright (c) 2013 pxceccaldi
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('wording', 'Create your wording translations file', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var delimiters = /\{\%=(.+?)\%\}/g;
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });


    function template(filepath) {

      var content = grunt.file.read(filepath);
      var result = [], a;
      while ((a = delimiters.exec(content))) {
        result.push(a[1].trim());
      }

      var path = require('path');
      var getExtension = path.extname(filepath);
      var removeExtension = filepath.replace(getExtension, '');
      var splitPath = removeExtension.split('/');

      var builder = JSON.parse(grunt.file.read('test/wording.json'));

      var data = builder;
      // Build nested object using the filepath until filename
      for (var i = 0; i < splitPath.length; i++ ) {
        builder[splitPath[i]] = builder[splitPath[i]] || {};
        builder = builder[splitPath[i]];
      }

      // Build file object with keys
      for ( i = 0; i < result.length; i++) {
        builder[result[i]] = builder[result[i]] || '';
      }

      // Create and fill wording.json
      grunt.file.write('test/wording.json', JSON.stringify(data, null, 2));

      // Replace keys in templates with their associated wordings
      grunt.util._.template(content, builder, {interpolate: delimiters});
    }

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(template);

      // Handle options.
      src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
