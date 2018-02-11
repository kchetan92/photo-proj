var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');

gulp.task('jsx', () =>
	gulp.src('public/src/jsx/main.js')
		.pipe(babel({
			plugins: ['transform-react-jsx']
		}))
		.pipe(gulp.dest('public/dist'))
);

gulp.task('sass', function () {
	return gulp.src('public/src/style/main.scss')
	  .pipe(sass().on('error', sass.logError))
	  .pipe(gulp.dest('public/dist'));
  });


gulp.task('default', function(){
	gulp.run('jsx', 'sass');

	gulp.watch('public/src/jsx/main.js', function(event){
		gulp.run('jsx')
	})

	gulp.watch('public/src/style/main.scss', function(event){
		gulp.run('sass')
	})
})