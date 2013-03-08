/*
 * grunt-wording
 * https://github.com/pix/grunt-contrib-wording
 *
 * Copyright (c) 2013 pxceccaldi
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('wording', 'Create your wording translations file', function() {

    // Merge task-specific and/or target-specific options with these defaults.

    var options = this.options({
      delimiters: /\{\%=(.+?)\%\}/g,
      sharedPrefix: "mutual",
      separator: '.',
      wording: 'test/wording.json',
      rootPapayawhip: 0
    });

    var delimiters = options.delimiters;
    var sharedPrefix = options.sharedPrefix;
    var fullPrefix = options.sharedPrefix + options.separator;

    function getFileKeys(file) {
      var keys = [], a;
      while (a = delimiters.exec(file)) {
        keys.push(a[1].trim());
      }
      return keys;
    }

    function template(filepath) {

      var fileContent = grunt.file.read(filepath);

      var keys = getFileKeys(fileContent);

      var getExtension = path.extname(filepath);
      var removeExtension = filepath.replace(getExtension, '');
      var splitPath = removeExtension.split(path.sep).slice(options.rootPapayawhip);

      var data = JSON.parse(grunt.file.read(options.wording));
      var builder = data;

      // force creation of a "mutual" object to centralize shared wordings
      data[sharedPrefix] = data[sharedPrefix] || {};

      // Build nested object using the filepath until filename
      for (var i = 0; i < splitPath.length; i++ ) {
        builder[splitPath[i]] = builder[splitPath[i]] || {};
        builder = builder[splitPath[i]];
      }

      // Build file object with keys
      for (i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(fullPrefix) !== 0 ) {
          builder[keys[i]] = builder[keys[i]] || '';
        } else {
          var key = keys[i].replace(fullPrefix, '');
          data[sharedPrefix][key] = data[sharedPrefix][key] || '';
        }
      }
      var templateData = grunt.util._.clone(builder);
      templateData[sharedPrefix] = data[sharedPrefix];

      //errors
      var errors = grunt.util._.difference(Object.keys(builder), keys);
      if (errors.length > 0) {
        grunt.log.warn('This or these key(s) ' + errors.join(', ') + " in " + (filepath) + ' are not used.');
      }

      // Create and fill wording.json
      grunt.file.write(options.wording, JSON.stringify(data, null, 2));

      // Replace keys in templates with their associated wordings
      var compiled = grunt.util._.template(fileContent, templateData, {interpolate: delimiters});
      grunt.file.write(path.join(this.data.dest, filepath), compiled);
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
      }).map(template, this);
    }, this);
  });

};