/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Image = require("./models/image");
// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});
router.get("/user/update", (req, res) => {
  User.updateOne({_id: req.user._id},{$inc: {numCreated: 1}}).then((users) => {
  });
});
router.get("/user/all", (req, res) => {
  User.find({}).then((users) => {
    res.send(users);
  });
});

router.get("/user", (req, res) => {
  User.findById(req.query.userid).then((user) => {
    res.send(user);
  });
});

router.get("/images/delete", (req) => {
  Image.deleteOne({creator_id: req.query.creator_id,_id:req.query._id}).then((images) => console.log("Image Deleted"));
});

router.get("/images/load", (req, res) => {
  // empty selector means get all documents
  Image.find({_id: req.query._id}).then((images) => res.send(images));
});

router.get("/images/all", (req,res) => {
  // empty selector means get all documents
  Image.find({}).then((images) => res.send(images));
});

router.get("/images/update", (req,res) => {
  Image.updateOne({_id: req.query._id},{$addToSet:{likedBy:req.user._id}}).then((images) => {
  });
});

router.get("/images", (req, res) => {
  // empty selector means get all documents
  Image.find({creator_id: req.query.creator_id}).then((images) => res.send(images));
});

router.post("/image", (req, res) => {
  const newImage = new Image({
    creator_name: req.user.name,
    creator_id: req.user._id,
    content: req.body.content,
    animation: req.body.animation,
    animMode: req.body.animMode,
    imageTitle: req.body.imageTitle,
    likedBy: [],
  });
  newImage.save().then((image) => res.send(image));
});





// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
