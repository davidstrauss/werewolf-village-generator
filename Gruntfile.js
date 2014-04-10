module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    jshint: {
      files: ["Gruntfile.js", "lib/*.js", "test/*.js", "test/**/*.js"],
      options: {
        jshintrc: "./.jshintrc"
      }
    },
    watch: {
      all: {
        files: ["Gruntfile.js", "lib/*.js", "test/*.js", "test/**/*.js"],
        tasks: ["jshint"]
      }
    },
    release: {
      options: {
        npm: false
      }
    }
  });

  grunt.loadNpmTasks("grunt-notify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-release");

  // Default task.
  grunt.registerTask("default", "watch");
};
