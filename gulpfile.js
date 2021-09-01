const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const glob = require('glob');
const path = require('path');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const Server = require('karma').Server;
const karmaParseConfig = require('karma/lib/config').parseConfig;

const entryPoint = 'src/app.tsx';
const testFilesPattern = 'tests/*.ts*';
const allTypeScriptFilesPattern = '**/*.ts*';
const sassFilesPattern = 'src/**/*.sass';
const htmlFilesPattern = 'src/**/*.html';

const buildApp = () =>
  browserify({ baseDir: '.', debug: true, entries: [entryPoint]})
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));

const buildTests = () =>
  browserify({ baseDir: '.', debug: true, entries: glob.sync(testFilesPattern) })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('tests/built'));

const runTests = (done, killOnCompletion) => {
  const config = karmaParseConfig(path.resolve('karma.conf.js'), {});
  config.autoWatch = false;
  config.singleRun = true;
  (new Server(config, exitCode => {
    console.log(`Karma has exited with ${exitCode}`);
    done();
    if (killOnCompletion) {
      // Don't kill when doing test-watch or will get "task did not complete" error
      process.exit(exitCode);
    }
  })).start();
};

const runTestsOnce = done => runTests(done, true);

const runTestsWithinTestWatch = done => runTests(done, false);

const copyHtml = () =>
  gulp.src([htmlFilesPattern])
    .pipe(gulp.dest('dist'));

const transformSass = () =>
  gulp.src([sassFilesPattern])
    .pipe(concat('style.sass'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'));

gulp.task('build-app-only', buildApp);

gulp.task('copy-pages-for-build', copyHtml);

gulp.task('transform-sass', transformSass);

gulp.task('test', gulp.series(buildTests, runTestsOnce));

gulp.task(
  'watch-tests',
  () => gulp.watch([allTypeScriptFilesPattern], gulp.series(buildTests, runTestsWithinTestWatch))
);

gulp.task(
  'watch',
  () => {
    gulp.watch([allTypeScriptFilesPattern], gulp.series(buildApp, buildTests, runTestsWithinTestWatch));
    gulp.watch([sassFilesPattern], gulp.series(transformSass));
    gulp.watch([htmlFilesPattern], gulp.series(copyHtml));
  }
);

gulp.task('build', gulp.parallel(transformSass, copyHtml, buildApp));

gulp.task('default', gulp.series('build', 'test'));