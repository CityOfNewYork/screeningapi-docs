// Tasks
// gulp build
// gulp

var browserSync = require('browser-sync').create(),
  gulp = require('gulp'),
  notify = require('gulp-notify'),
  concat = require('gulp-concat'),
  twig = require('gulp-twig'),
  twigMarkdown = require('twig-markdown'),
  sass = require('gulp-sass');

var DIST = 'dist/',
  SOURCE = 'src/';

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/js/*.js')
    .pipe(concat('source.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(notify({message: 'Scripts task complete'}))

});

// styles
gulp.task('styles', function() {
  return gulp.src('src/scss/*.scss')
    .pipe(sass({
      includePaths: [
        'node_modules',
        'node_modules/access-nyc-patterns/src'
      ]
    }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(notify({message: 'Styles task complete'}))

});

// resources
gulp.task('resources', function() {
  return gulp.src('src/resources/*.yaml')
    .pipe(gulp.dest('dist/resources'))
    .pipe(notify({message: 'Resources task complete'}))
});

// views
gulp.task('views', function () {
  return gulp.src('src/views/*.twig')
    .pipe(twig({data: {}, extend: twigMarkdown}))
    .pipe(gulp.dest('dist'))
    .pipe(notify({message: 'Views task complete'}))

});


// DEFAULT
gulp.task('default', function(){
  browserSync.init({
    server: {
      baseDir: 'dist/',
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    open: false
  });

  gulp.watch(SOURCE+'js/**/*', gulp.series('scripts'));
  gulp.watch(SOURCE+'views/**/*', gulp.series('views'));
  gulp.watch(SOURCE+'scss/**/*', gulp.series('styles'));
  gulp.watch(SOURCE+'resources/**/*', gulp.series('resources'));
  
  gulp.watch("dist/*").on('change', browserSync.reload);
});

// BUILD
gulp.task('build', gulp.parallel('scripts', 'views'));
