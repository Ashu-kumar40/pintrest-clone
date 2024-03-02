var express = require("express");
var router = express.Router();
var userModel = require("./users");
const passport = require("passport");

// these below two lines are for user login
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  // console.log(req.flash("error")); // this line is possible because of making faileureFlash: true, in login route
  res.render("login", {error: req.flash('error')}); // here we are passing the value of error to login.ejs file check that file.
});

router.get("/feed", function (req, res, next) {
  res.render("feed");
});

router.get("/profile", isLoggedIn, function (req, res, next) {
  res.render("profile")
});

router.post("/register", function (req, res) {
  // const userData = new userModel({
  //   username: req.body.username,
  //   email: req.body.email,
  //   fullName: req.body.fullName,
  // })
  // we can write the above code in short form as below

  const { username, email, fullName } = req.body;
  const userData = new userModel({ username, email, fullName }); // when we have key and value same then we can write it as a singe word

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash:true, // to show the flash messages if user fill wrong details

  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
