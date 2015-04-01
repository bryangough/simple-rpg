module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat:{
            dist:{
                src:[
                    'Gamejs/*.js'
                ],
                dest: 'Gamejs/build/RPGSimple_concat.js'
            }
        },
        uglify:{
          build:{
              src: 'Gamejs/build/RPGSimple_concat.js',
              dest: 'js/RPGSimple.min.js'
          }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default',['concat','uglify']);
};