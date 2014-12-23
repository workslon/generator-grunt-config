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
        'jade',
        'less',
        'coffee',
        'concat',
        'imagemin',
        'watch',
        'clean',
        'copy',
        'coffeelint',
        'wrap'
      ],
      default: [
        'jade',
        'less',
        'coffee',
        'concat',
        'imagemin',
        'watch'
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
          taskPath,
          defaultAlias;

      // copy gruntfile template
      this.gruntfilePath = this.destinationPath('Gruntfile.coffee');
      this.fs.copy(
        this.templatePath('_gruntfile.coffee'),
        this.gruntfilePath
      );

      // create grunt directory
      fs.mkdir(this.destinationPath('grunt'), (function () {
        console.log('Next tasks were added\n');

        // create aliases
        defaultAlias = {default: this.tasks};
        fs.writeFile(this.destinationPath('grunt/aliases.yaml'), JSON.stringify(defaultAlias));

        // create grunt task files
        this.tasks.forEach(function (task) {
          taskPath = path.join(gruntDir, task + '.coffee');
          fs.writeFile(taskPath, 'module.exports = (grunt) ->', function () {
            console.log(taskPath);
          });
        });
      }).bind(this));
    }
  },

  end: function () {
    console.log('\nThat\'s it my friend!\n');
  }
});

module.exports = GruntConfigGenerator;
