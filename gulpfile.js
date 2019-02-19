// TASKS
// gulp build
// gulp

var browserSync = require('browser-sync').create(),
  babelify = require('babelify'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  concat = require('gulp-concat'),
  gulp = require('gulp'),
  notify = require('gulp-notify'),
  postcss = require('gulp-postcss'),
  tailwindcss = require('tailwindcss'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  stylelint = require('gulp-stylelint'),
  svgmin = require('gulp-svgmin'),
  svgstore = require('gulp-svgstore'),
  twig = require('gulp-twig'),
  twigMarkdown = require('twig-markdown'),
  gulpif = require('gulp-if');

const NODE_ENV = process.env.NODE_ENV;
const DIST_PROD = 'dist/68d422386f1c9b95dab97295f2644aa1687647a4/';
const DIST = (NODE_ENV === 'development') ? 'dev/' : DIST_PROD;
const SOURCE = 'src/';
const PACKAGE = require('./package.json');

// SCRIPTS
gulp.task('scripts', function() {
  return gulp.src([
    DIST + 'js/source.js',
  ])
    .pipe(concat('source.js'))
    .pipe(gulp.dest(DIST + 'js'))
    .pipe(gulpif((NODE_ENV !== 'development'),
      notify({message: 'Scripts task complete'})));
});

gulp.task('scripts:browserify', function() {
  return browserify({
    entries: [SOURCE + 'js/main.js'],
    paths: ['node_modules'],
    debug: false
  })
    .transform('babelify', {presets: ["@babel/preset-env"]})
    .bundle()
    .pipe(source('source.js'))
    .pipe(buffer())
    .pipe(gulp.dest(DIST + 'js'))
    .pipe(gulpif((NODE_ENV !== 'development'),
      notify({message: 'Scripts:browserify task complete'})));
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
        'node_modules/nyco-patterns/src'
      ]
    }))
    .pipe(postcss([
      tailwindcss('./node_modules/nyco-patterns/config/tailwind.js'),
      require('autoprefixer'),
    ]))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(DIST + 'css'))
    .pipe(gulpif((NODE_ENV !== 'development'),
      notify({message: 'Styles task complete'})));
}));

// RESOURCES
gulp.task('resources', function() {
  return gulp.src(SOURCE + 'resources/*')
    .pipe(gulp.dest(DIST + 'resources'))
    .pipe(gulpif((NODE_ENV !== 'development'),
      notify({message: 'Resources task complete'})));
});

// ICONS
gulp.task('icons', function () {
  return gulp.src([
    'node_modules/nyco-patterns/src/svg/*.svg'
    ])
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('icons.svg'))
    .pipe(gulp.dest(DIST + 'svg'))
    .pipe(gulpif((NODE_ENV !== 'development'),
      notify({message: 'Icons task complete'})));
});

// VIEWS
gulp.task('views', function () {
  return gulp.src('src/views/*.twig')
    .pipe(twig({data: {package: PACKAGE}, extend: twigMarkdown}))
    .pipe(gulp.dest(DIST))
    .pipe(gulpif((NODE_ENV !== 'development'),
      notify({message: 'Views task complete'})));
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
  gulp.watch(SOURCE+'js/**/*', gulp.series('scripts:browserify', 'scripts'));
  gulp.watch(SOURCE+'views/**/*', gulp.series('resources', 'styles', 'views'));

  gulp.watch(DIST + '/*').on('change', browserSync.reload);
});

// BUILD
gulp.task('build', gulp.parallel(
  'resources',
  'icons',
  'scripts',
  'styles',
  'views'
));
