"use strict";

const gulp = require("gulp");
const webpack = require("webpack-stream");
const browsersync = require("browser-sync");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("autoprefixer");
const cleanCSS = require("gulp-clean-css");
const postcss = require("gulp-postcss");
const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");

// const dist = "/Applications/MAMP/htdocs/test"; // Ссылка на вашу папку на локальном сервере
const dist = "./dist";
const prod = "./prod";

gulp.task("copy-html", () => {
   return gulp.src("./src/index.html").pipe(gulp.dest(dist)).pipe(browsersync.stream());
});

gulp.task("build-sass", () => {
   return gulp
      .src("./src/sass/**/*.+(scss|sass|css)")
      .pipe(sass().on("error", sass.logError))
      .pipe(gulp.dest(dist))
      .pipe(browsersync.stream());
});

gulp.task("fonts", function () {
   return gulp.src("src/fonts/**/*").pipe(gulp.dest("dist/fonts")).pipe(browsersync.stream());
});

gulp.task("icons", function () {
   return gulp.src("src/icons/**/*").pipe(gulp.dest("dist/icons")).pipe(browsersync.stream());
});

gulp.task("images", function () {
   return gulp.src("src/img/**/*").pipe(gulp.dest("dist/img")).pipe(browsersync.stream());
});

gulp.task("build-js", () => {
   return gulp
      .src("./src/js/main.js")
      .pipe(
         webpack({
            mode: "development",
            output: {
               filename: "script.js",
            },
            watch: false,
            devtool: "source-map",
            module: {
               rules: [
                  {
                     test: /\.m?js$/,
                     exclude: /(node_modules|bower_components)/,
                     use: {
                        loader: "babel-loader",
                        options: {
                           presets: [
                              [
                                 "@babel/preset-env",
                                 {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage",
                                 },
                              ],
                           ],
                        },
                     },
                  },
               ],
            },
         })
      )
      .pipe(gulp.dest(dist))
      .on("end", browsersync.reload);
});

gulp.task("watch", () => {
   browsersync.init({
      server: "./dist/",
      port: 4000,
      notify: true,
   });

   gulp.watch("./src/*.html", gulp.parallel("copy-html"));
   gulp.watch("./src/js/**/*.js", gulp.parallel("build-js"));
   gulp.watch("./src/sass/**/*.+(scss|sass|css)", gulp.parallel("build-sass"));
   gulp.watch("src/fonts/**/*").on("all", gulp.parallel("fonts"));
   gulp.watch("src/icons/**/*").on("all", gulp.parallel("icons"));
   gulp.watch("src/img/**/*").on("all", gulp.parallel("images"));
});

gulp.task(
   "build",
   gulp.parallel("copy-html", "build-js", "build-sass", "fonts", "icons", "images")
);

gulp.task("prod", () => {
   gulp
      .src("./dist/*.html")
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest(prod));
   gulp
      .src("./dist/*.css")
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss([autoprefixer()]))
      .pipe(cleanCSS())
      .pipe(gulp.dest(prod));

   gulp.src("./dist/fonts/**/*").pipe(gulp.dest(`${prod}/fonts`));
   gulp.src("./dist/icons/**/*").pipe(gulp.dest(`${prod}/icons`));
   gulp
      .src("./dist/img/**/*")
      .pipe(imagemin())
      .pipe(gulp.dest(`${prod}/img`));

   return gulp
      .src("./dist/*.js")
      .pipe(
         webpack({
            mode: "production",
            output: {
               filename: "script.js",
            },
            module: {
               rules: [
                  {
                     test: /\.m?js$/,
                     exclude: /(node_modules|bower_components)/,
                     use: {
                        loader: "babel-loader",
                        options: {
                           presets: [
                              [
                                 "@babel/preset-env",
                                 {
                                    corejs: 3,
                                    useBuiltIns: "usage",
                                 },
                              ],
                           ],
                        },
                     },
                  },
               ],
            },
         })
      )
      .pipe(gulp.dest(prod));
});

gulp.task("default", gulp.parallel("watch", "build"));
