const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/authMW");

const taskController = require("../controllers/taskController");

router
  .route("/fetchTask")
  .get(authMW.isAuthenticated, taskController.fetchTask);
router
  .route("/createTask")
  .post(authMW.isAuthenticated, taskController.createTask);
router
  .route("/updateTask")
  .patch(authMW.isAuthenticated, taskController.updateTask);
router
  .route("/deleteTask")
  .delete(authMW.isAuthenticated, taskController.deleteTask);

module.exports = router;
