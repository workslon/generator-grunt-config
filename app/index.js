'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var fs = require('fs');

var GruntConfigGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
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
        'grunt-contrib-concat',
        'grunt-contrib-imagemin',
        'grunt-contrib-watch',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-coffeelint',
        'grunt-wrap'
      ],
      default: [
        'grunt-contrib-jade',
        'grunt-contrib-less',
        'grunt-contrib-coffee',
        'grunt-contrib-concat',
        'grunt-contrib-imagemin',
        'grunt-contrib-watch',
        ]
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

      // copy gruntfile template
      this.gruntfilePath = this.destinationPath('Gruntfile.coffee');
      this.fs.copy(
        this.templatePath('_gruntfile.coffee'),
        this.gruntfilePath
      );

      // manage package.json
      pkgPath = this.destinationPath('package.json');

      if (fs.existsSync(pkgPath)) {
        pkg = require(pkgPath);
      } else {
        pkg = {
          name: 'project',
          engines: {
            node: '>= 0.10.0'
          },
          devDependencies: {
            grunt: 'latest'
          },
          dependencies: {
            'time-grunt': "latest"
          }
        };
      }

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
        fs.writeFile(pkgPath, JSON.stringify(pkg));

        // create aliases
        defaultAlias = {default: this.tasks};
        fs.writeFile(this.destinationPath('grunt/aliases.yaml'), JSON.stringify(defaultAlias));
      }).bind(this));
    }
  },

  end: function () {
    this.npmInstall();
  }
});

module.exports = GruntConfigGenerator;
