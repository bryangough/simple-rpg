module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            includeSource: {
                files: ['src/**/*.js'],
                tasks: ['includeSource'],
                options: {
                    event: ['added', 'deleted']
                }
            }
        },
        concat:{
            dist:{
                src:[
                    'src/**/*.js'
                ],
                dest: 'js/build/RPGSimple_concat.js'
            }
        },
        uglify:{
          build:{
              src: 'js/build/RPGSimple_concat.js',
              dest: 'js/RPGSimple.min.js'
          }
        },
        includeSource: {
            options: {
                basePath: 'src',
                templates: {
                    html: {
                        js: '<script src="src/{filePath}"></script>',
                        css: '<link rel="stylesheet" type="text/css" href="{filePath}" />',
                    }
                }
            },
            target: {
                files: {
                    'index.html': 'index.html'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default',['concat', 'uglify', 'includeSource']);
};