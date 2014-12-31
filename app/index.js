'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var fs = require('fs');

var GruntConfigGenerator = yeoman.generators.Base.extend({
  initializing: function () {

    this.initGruntfile = function () {
      var gruntfilePath = this.destinationPath('Gruntfile.coffee');

      this.fs.copy(
        this.templatePath('_gruntfile.coffee'),
        gruntfilePath
      );
    };

    this.getBasePackage = function () {
      var pkgPath = this.destinationPath('package.json'),
          defaults = {
            name: 'project',
            engines: {
              node: '>= 0.10.0'
            },
            devDependencies: {
              'grunt': 'latest',
              'grunt-newer': 'latest',
              'load-grunt-config': 'latest'
            },
            dependencies: {
              'time-grunt': 'latest'
            }
          },
          pkg = defaults;

      // add non-existent properties to package.json
      // if package.json already exists
      if (fs.existsSync(pkgPath)) {
        pkg = require(pkgPath);

        (function recurse(defaults, pkg) {
          for (var key in defaults) {
            if (!pkg[key]) {
              pkg[key] = defaults[key];
            } else {
              if (Object.prototype.toString.call(pkg[key]) === '[object Object]') {
                recurse(defaults[key], pkg[key]);
              }
            }
          }
        })(defaults, pkg);
      }

      return pkg;
    }
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Hey! Here you can config your grunt automation.'
    ));

    var prompts = [{
      type: 'checkbox',
      name: 'tasks',
      message: 'Choose required tasks',
      choices: [
        'grunt-contrib-jade',
        'grunt-contrib-less',
        'grunt-contrib-coffee',
        'grunt-contrib-uglify',
        'grunt-contrib-concat',
        'grunt-contrib-imagemin',
        'grunt-contrib-watch',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-coffeelint',
        'grunt-wrap'
      ],
      default: []
    }];

    this.prompt(prompts, function (props) {
      this.tasks = props.tasks;
      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      var gruntDir = 'grunt',
          pkg,
          pkgPath,
          taskPath,
          defaultAlias;

      this.initGruntfile();
      pkg = this.getBasePackage();

      // create grunt directory
      fs.mkdir(this.destinationPath('grunt'), (function () {
        this.tasks.forEach((function (task) {
          // create grunt task files
          taskPath = path.join(gruntDir, task.replace(/^.*-/, '') + '.coffee');
          fs.writeFile(taskPath, 'module.exports = (grunt) ->');

          // collect dev dependencies
          pkg.devDependencies[task] = 'latest';
        }).bind(this));

        // add new dependencies to package.json
        fs.writeFile(this.destinationPath('package.json'), JSON.stringify(pkg));

        // create aliases
        defaultAlias = {default: this.tasks};
        fs.writeFile(this.destinationPath('grunt/aliases.yaml'), JSON.stringify(defaultAlias));
      }).bind(this));
    }
  },

  end: function () {
    this.task && this.npmInstall();
  }
});

module.exports = GruntConfigGenerator;
