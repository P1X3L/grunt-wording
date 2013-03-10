# grunt-wording

> A grunt plugin to help you auto generate wordings in your application.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-wording --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-wording');
```

## The "wording" task

### Overview
In your project's Gruntfile, add a section named `wording` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  wording: {
    compiled {
      options: {
        // Task-specific options go here.
      },
      src: [// Add the paths to the files you want the grunt-wording plugin to treat ],
      dest: // Destination of compiled files goes here.
    }
  },
})
```

### Options

#### options.delimiters
Type: Table
Default value: ['{%', '%}']

A table that is used to set your opening and closing delimiters to add a
wording key in your file.

#### options.sharedPrefix
Type: `String`
Default value: `mutual`

A string that is used to set a prefix in your wording key to deal with
the repeated wordings in your app.

#### options.separator
Type: `String`
Default value: `.`

A string that is used to separate the sharedPrefix from your wording
key.

#### options.wording
Type: `String`

!! WARNING !! This isn't an option, it is a REQUIRED value. It is the path you want your wording.json to be generated.


#### options.rootPapayawhip
Type: Integer
Default value: 0




### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  wording: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
})
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  wording: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
