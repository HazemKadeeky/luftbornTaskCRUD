const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { sendResponse } = require("../utils/sendResponse");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports.isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return next(new AppError("You need to login first", 401));

  const user = await jwt.verify(token, `${process.env.JWT_SECRET_KEY}`);

  req.user = user;
  next();
});
