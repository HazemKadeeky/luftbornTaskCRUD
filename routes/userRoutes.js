const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/authMW");

const userController = require("../controllers/userController");

router.route("/register").post(userController.registerUser);
router.route("/login").post(userController.loginUser);
router
  .route("/editProfile/:id?")
  .post(authMW.isAuthenticated, userController.editProfile);
// router.post("/forgotPassword", userController.forgotPassword);
router
  .route("/getUserProfile/:id?")
  .get(authMW.isAuthenticated, userController.getUserProfile);
router.route("/getAllUsers").get(userController.getAllUsers);

// router.route("/sendMail").get(userController.sendMail);

module.exports = router;
