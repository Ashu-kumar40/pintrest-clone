var express = require("express");
var router = express.Router();
var userModel = require("./users");
var postModel = require("./posts");
const passport = require("passport");

//for uploading files require the following package
const upload = require("./multer");

// these below two lines are for user login
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  // console.log(req.flash("error")); // this line is possible because of making faileureFlash: true, in login route
  res.render("login", { error: req.flash("error") }); // here we are passing the value of error to login.ejs file check that file.
});

router.get("/feed", function (req, res, next) {
  res.render("feed");
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  // to get the profile information on the profile route, we need have access of user that logged in, here is we can do this
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  // console.log(user); // we can see the user details in console
  res.render("profile", { user });
});

// route for file upload
router.post("/upload", isLoggedIn, upload.single("file"), async function (req, res, next) {
    if (!req.file) {
      return res.status(404).send("No file was uploaded!");
    }
    // accessing the user
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    // Now passing the user details when creating a post
    const postData = await postModel.create({
      image: req.file.filename,
      description: req.body.description,
      user: user._id,
    });
    user.posts.push(postData._id);
    await user.save();
    res.redirect("/profile");
    // res.send("File uploaded succesfully:)");
  }
);

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
    failureFlash: true, // to show the flash messages if user fill wrong details
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.post("/updatedp", isLoggedIn, upload.single("profileImage"), async function(req,res){
  const user = await userModel.findOne({username: req.session.passport.user});
  user.dp = req.file.filename;
  await user.save()
  res.redirect("/profile")
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
