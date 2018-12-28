// TASKS
// gulp build
// gulp

var browserSync = require('browser-sync').create(),
  gulp = require('gulp'),
  notify = require('gulp-notify'),
  concat = require('gulp-concat'),
  twig = require('gulp-twig'),
  svgmin = require('gulp-svgmin'),
  svgstore = require('gulp-svgstore'),
  rename = require('gulp-rename'),
  twigMarkdown = require('twig-markdown'),
  sass = require('gulp-sass'),
  stylelint = require('gulp-stylelint');

// var DIST = 'dist/',
var DIST = 'dist/68d422386f1c9b95dab97295f2644aa1687647a4/',
  SOURCE = 'src/',
  PATTERNS = 'node_modules/access-nyc-patterns/';

// SCRIPTS
gulp.task('scripts', function() {
  return gulp.src([
    SOURCE + 'js/*.js',
    PATTERNS + 'dist/scripts/*.js'
  ])
    .pipe(concat('source.js'))
    .pipe(gulp.dest(DIST + 'js'))
    .pipe(notify({message: 'Scripts task complete'}))
});

// STYLES - LINTING
gulp.task('lint-css', function(){
  return gulp.src([
    SOURCE + 'scss/**/*.scss'
  ])
  .pipe(stylelint({
    reporters: [
      {formatter: 'string', console: true}
    ],
    syntax: "scss"
  }));
});

// STYLES
gulp.task('styles', gulp.series('lint-css', function () {
  return gulp.src(SOURCE + 'scss/*.scss')
    .pipe(sass({
      includePaths: [
        'node_modules',
        'node_modules/access-nyc-patterns/src'
      ]
    }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(DIST + 'css'))
    .pipe(notify({message: 'Styles task complete'}))
}));

// RESOURCES
gulp.task('resources', function() {
  return gulp.src(SOURCE + 'resources/*')
    .pipe(gulp.dest(DIST + 'resources'))
    .pipe(notify({message: 'Resources task complete'}))
});

// IMAGES
gulp.task('images', function() {
  return gulp.src(PATTERNS + 'dist/images/*')
    .pipe(gulp.dest(DIST + 'images'))
    .pipe(notify({message: 'Images task complete'}))
});

// ICONS
gulp.task('icons', function () {
  return gulp.src(PATTERNS + 'src/svg/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('icons.svg'))
    .pipe(gulp.dest(DIST + 'svg'))
    .pipe(notify({message: 'Icons task complete'}))
});

// VIEWS
gulp.task('views', function () {
  return gulp.src('src/views/*.twig')
    .pipe(twig({data: {}, extend: twigMarkdown}))
    .pipe(gulp.dest(DIST))
    .pipe(notify({message: 'Views task complete'}))

});

// DEFAULT
gulp.task('default', function(){
  browserSync.init({
    server: {
      baseDir: DIST,
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    open: false
  });

  gulp.watch(SOURCE+'resources/**/*', gulp.series('resources'));
  gulp.watch(SOURCE+'scss/**/*', gulp.series('styles', 'views'));
  gulp.watch(SOURCE+'content/**/*', gulp.series('styles', 'views'));
  gulp.watch(SOURCE+'js/**/*', gulp.series('scripts'));
  gulp.watch(SOURCE+'views/**/*', gulp.series('resources', 'styles', 'views'));
  
  gulp.watch(DIST + '/*').on('change', browserSync.reload);
});

// BUILD
gulp.task('build', gulp.parallel(
  'resources', 
  'images',
  'icons', 
  'scripts', 
  'styles', 
  'views'
));
