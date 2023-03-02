const _ = require("lodash");
const { Task } = require("../models/taskModel");
const catchAsync = require("../utils/catchAsync");
const { sendResponse } = require("../utils/sendResponse");

const AppError = require("../utils/appError");

// Creates A Task
module.exports.createTask = catchAsync(async (req, res, next) => {
  console.log("Creating Task", req.body);

  let task = new Task(req.body);
  let savedTask = await task.save();

  if (savedTask) return sendResponse(res, 200, savedTask, "Task Created");
  return next(new AppError("Cannot create task", 422));
});

//Read A Task
module.exports.fetchTask = catchAsync(async (req, res, next) => {
  console.log("Reading Task", req.body);
  let body = _.pick(req.body, ["name", "username"]);

  var savedTask = await Task.findOne(body);

  if (savedTask) return sendResponse(res, 200, savedTask, "Task Fetched");
  return next(new AppError("Cannot fetch task", 422));
});

//Updates A Task
module.exports.updateTask = catchAsync(async (req, res, next) => {
  console.log("Updating Task", req.body);
  let body = _.pick(req.body, ["name", "username"]);
  let tempBody = _.pick(req.body, ["newName", "newDescription"]);

  let newBody = {
    name: tempBody.newName,
    description: tempBody.newDescription,
  };

  var savedTask = await Task.findOneAndUpdate(body, newBody);

  if (savedTask) return sendResponse(res, 200, savedTask, "Task Updated");
  return next(new AppError("Cannot update task", 422));
});

// Deletes A Task
module.exports.deleteTask = catchAsync(async (req, res, next) => {
  console.log("Deleting Task", req.body);
  let body = _.pick(req.body, ["name", "username"]);

  var savedTask = await Task.findOneAndDelete(body, {
    new: true,
  });

  if (savedTask) return sendResponse(res, 200, savedTask, "Task Deleted");
  return next(new AppError("Cannot delete task", 422));
});
