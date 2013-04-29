(function($) {
  'use strict';

  var keepTags = ['img', 'br'];

  function escapeHTML(html) {
    return html.replace('&nbsp;', ' ').replace(/<\/?([a-z]+)[^>]*>/gi, function(match, tag) {
      return (keepTags.indexOf(tag.toLowerCase()) > 0) ? match : '';
    });
  }

  /**
   * This method can change the value a nested object
   * identified by a path-like string. It then returns
   * the object itself.
   *
   * @example
   *     nestedWrite({foo: { bar: { baz: 'quz' } } }, 'foo/bar/baz', 'quuz')
   *      <- {foo: { bar: { baz: 'quuz' } } }
   *
   * @param  {Object} obj   Root object.
   * @param  {String} path  Path string.
   * @param  {Any}    value New value.
   * @return {Object}
   */
  function nestedWrite(obj, path, value) {
    path = path.split('/');
    var key = path.splice(path.length - 1, 1)[0];
    nestedRead(obj, path.join('/'))[key] = value;
    return obj;
  }

  /**
   * This method can fetch from nested object a value
   * identified by a path-like string.
   *
   * @example
   *     nestedRead({foo: { bar: { baz: 'quz' } } }, 'foo/bar/baz')
   *      <- 'quz'
   *
   * @param  {Object} obj  Root object.
   * @param  {String} path Path string.
   * @return {Any}
   */
  function nestedRead(obj, path) {
    var o = obj;
    path.split('/').forEach(function(k) { o = o[k]; });
    return o;
  }

  $(document).ready(function() {
    var mainEl = $('#main'),
        templatesEl = $('#templates'),
        saveEl = $('#save'),
        ejsEl = $('#ejs-warning'),
        matcher = /\{\%=\s*(\S+?)\s*\%\}/g,
        ejs = /\<\%=?([\s\S]+?)\%\>/g,
        mutual = 'mutual',
        wording, templates;

    saveEl.on('mousedown', save);

    function init() {
      templatesEl.append(templates.map(function(tpl) {
        return $('<li>')
          .text(tpl.replace('templates/', ''))
          .on('mousedown', function() { load(tpl); })
          .on('mousedown', function() { $(this).siblings().removeClass('focus'); })
          .on('mousedown', function() { $(this).addClass('focus'); });
      }));
    }

    function save() {
      mainEl.find('a[data-key]').each(function() {
        var key = $(this).attr('data-key');
        nestedWrite(wording, key, escapeHTML($(this).html()));
      });

      return $.ajax({
        url: '/wording',
        type: 'POST',
        dataType : 'json',
        data: wording
      });
    }

    function load(tpl) {
      function toggle(html) {
        ejsEl.toggle(!!html.match(ejs));
        return html;
      }

      function parse(html) {
        return html
          .replace(matcher, function(match, key) {
            var path;
            if (key.indexOf(mutual + '.') === 0) {
              path = key.split('.').join('/');
            } else {
              path = tpl + '/' + key;
            }
            return '<a data-key="' + path + '" contenteditable="true">' + nestedRead(wording, path) + '</a>';
          })
          .replace(ejs, '');
      }

      $.ajax('/templates/' + tpl)
        .then(toggle)
        .then(parse)
        .then(mainEl.html.bind(mainEl));
    }

    $.when(
      $.ajax('/wording'),
      $.ajax('/templates')
    )
    .then(function(w, t) {
      wording = w[0];
      templates = t[0];
    })
    .then(init);
  });

})(window.jQuery);
