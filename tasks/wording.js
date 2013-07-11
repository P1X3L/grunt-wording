/*
 * grunt-wording
 * https://github.com/P1X3L/grunt-wording
 *
 * Copyright (c) 2013 pxceccaldi
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {
  var _ = grunt.util._,
      options,
      data,
      shared,
      fullPrefix,
      originalPaths = [],
      jsonPaths;

  function isEmptyFile(filePath) {
    return !grunt.file.exists(filePath) || !grunt.file.read(filePath).trim().length;
  }

  function hasWording(fileContent) {
    return (getFileKeys(fileContent).filter(function(key) {
      return (key.indexOf(fullPrefix) !== 0);
    }).length > 0);
  }

  function getFileKeys(fileContent) {
    var keys = [], a;
    while (a = _.templateSettings.interpolate.exec(fileContent)) {
      keys.push(a[1].trim());
    }
    return keys.sort();
  }

  /*
   * returns a table from a path. For example :
   * "app/template/file.ejs" returns ['app', 'template', 'file']
   */
  function noExtensionPath(filePath) {
    return filePath.replace(path.extname(filePath), '').split(path.sep);
  }

  function cutPath(filePath) {
    return noExtensionPath(filePath).slice(options.rootPapayawhip);
  }

  function createWording(filePath, fileContent) {
    var keys       = getFileKeys(fileContent),
        usablePath = cutPath(filePath);

    // Build nested object using the filepath until filename
    var builder = data;
    usablePath.forEach(function(dir) {
      if (!builder[dir]) {
        builder[dir] = {};
        grunt.log.ok('Add file or directory ' + dir);
      }
      builder = builder[dir];
    });

    // Build file object with keys
    var created = [];
    keys.forEach(function(key) {
      if (key.indexOf(fullPrefix) !== 0) {
        if (typeof builder[key] !== 'undefined') { return; }
        builder[key] = '';
        created.push(key);
      } else {
        key = key.replace(fullPrefix, '');
        if (typeof shared[key] !== 'undefined') { return; }
        shared[key] = '';
        created.push(fullPrefix + key);
      }
    });

    // Non used keys
    var diff = _.difference(Object.keys(builder), keys).filter(function(key) {
      return typeof builder[key] === 'string';
    });
    if (diff.length > 0) {
      grunt.log.errorlns('Unused key(s) ' + grunt.log.wordlist(diff, { color: 'red' }) + ' for ' + filePath);
    }

    // Created keys
    if (created.length > 0) {
      grunt.log.oklns('Created key(s) ' + grunt.log.wordlist(created, { color: 'green' }) + ' for ' + filePath);
    }

    if (created.length || diff.length) {
      grunt.log.writeln();
    }

    return _.clone(builder);
  }

  function template(filePath) {
    var fileContent = grunt.file.read(filePath);
    // Replace keys in templates with their associated wordings
    try {
      var templateData = hasWording(fileContent) ? createWording(filePath, fileContent) : {};
      templateData[options.sharedPrefix] = shared;

      var compiled = _.template(fileContent, templateData);
      var dest = path.join(this.data.dest, filePath);

      grunt.verbose.write('Creating template ' + dest + '...');
      grunt.file.write(dest, compiled);
      grunt.verbose.ok();
    } catch (e) {
      grunt.verbose.error();
      grunt.log.errorlns(e);
      grunt.fail.warn('Error while templating ' + filePath);
    }
  }

  grunt.registerMultiTask('wording', 'Create your wording translations file', function() {

    function getPathsFromData(obj, previousPath, accumulator) {
      accumulator = accumulator || {};
      var begining = previousPath.length === 0;
      for (var key in obj) {
        if (typeof obj[key] === 'string') {
          accumulator[previousPath] = true;
          continue;
        }
        getPathsFromData(obj[key], previousPath + (begining ? '' : '/') + key, accumulator);
      }
      return accumulator;
    }

    options = this.options({
      delimiters: 'config',
      sharedPrefix: 'mutual',
      wording: 'wording/wording.json',
      rootPapayawhip: 0
    });

    grunt.template.setDelimiters(options.delimiters);

    if (isEmptyFile(options.wording)) {
      data = {};
    } else {
      data = JSON.parse(grunt.file.read(options.wording));

      jsonPaths = getPathsFromData(data, '');
      delete jsonPaths[options.sharedPrefix];
      delete jsonPaths.webapp;
      jsonPaths = Object.keys(jsonPaths);
    }

    // full prefix with a dot at the end (i.e. "mutual.")
    fullPrefix = options.sharedPrefix + '.';

    // force creation of a "mutual" object to centralize shared wordings
    shared = data[options.sharedPrefix] = data[options.sharedPrefix] || {};

    // Iterate over all specified file groups.
    this.files.forEach(function(file) {
      file.src.sort().map(template, this);
    }, this);

   /*
    * Warn if an object becomes useless because its
    * original path does not exist (deleted or renamed file)
    */
    var inexistantPaths = _.difference(jsonPaths, originalPaths);
    for (var i = 0; i < inexistantPaths.length; i++) {
      var unusedObject = path.basename(inexistantPaths[i]);
      inexistantPaths[i] = path.dirname(inexistantPaths[i]).replace(/\//g, '.');
      grunt.log.errorlns(
        'Unused object ' +
        grunt.log.wordlist([unusedObject], {color: 'cyan'}) +
        ' in wording.json at ' +
        grunt.log.wordlist([inexistantPaths[i]], {color: 'red'})
      );
    }

    // Create and fill wording.json
    grunt.log.write('Writing ' + options.wording + '...');
    grunt.file.write(options.wording, JSON.stringify(data, null, 2) + '\n');
    grunt.log.ok();
  });
};
