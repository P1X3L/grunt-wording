/*
 * grunt-wording
 * https://github.com/P1X3L/grunt-wording
 *
 * Copyright (c) 2013 pxceccaldi
 * Licensed under the MIT license.
 */

'use strict';

var root = __dirname + '/editor';
var path = require('path');
var express = require('express');
var app = express();

module.exports = function(grunt) {
  var _ = grunt.util._;

  grunt.registerMultiTask('editor', function() {
    var options = this.options({
      delimiters: 'config',
      port: 9001,
      public: '/',
      prefix: '',
      extension: 'ejs'
    });

    var filesSrc = this.filesSrc;
    grunt.template.setDelimiters(options.delimiters);

    function hasWording(path) {
      return grunt.file.read(path).match(_.templateSettings.interpolate);
    }

    app.use(express.static(root));
    app.use(express.static(options.public));
    app.use(express.bodyParser());

    app.get('/wording', function(req, res) {
      res.set('Content-Type', 'application/json; charset=UTF-8');
      res.send(grunt.file.read(options.wording));
    });

    app.post('/wording', function(req, res) {
      grunt.file.write(options.wording, JSON.stringify(req.body, null, 2) + '\n');
      res.send(200);
    });

    app.get('/templates', function(req, res) {
      var files = filesSrc.filter(hasWording).map(function(path) {
        return path.replace(options.prefix, '').replace('.' + options.extension, '');
      });
      res.set('Content-Type', 'application/json; charset=UTF-8');
      res.send(JSON.stringify(files));
    });

    app.get('/templates/*', function(req, res, next) {
      var template = req.params[0];
      res.set('Content-Type', 'text/html');
      res.send(grunt.file.read(path.join(options.prefix, template + '.' + options.extension)));
    });

    app.listen(options.port);
    grunt.log.ok('Running on http://localhost:' + options.port);
    this.async();
  });
};
