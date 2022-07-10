const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
//Register
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });
  //above just is create a User in a variable, havent stored inside the mongoDB yet.
  //Save now
  try {
    const savedUser = await newUser.save();
    //201 mean successful added
    res.status(201).json(savedUser);
  } catch (err) {
    //Could add more here to shows the error msg to the users
    res.status(500).json(err);
  }
});
//LOGIN
router.post("/login", async (req, res) => {
  //using await should use try and catch
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(401).json("Wrong credentials");
    }
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const oriPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (oriPassword !== req.body.password) {
      res.status(401).json("Wrong credentials");
    }
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
