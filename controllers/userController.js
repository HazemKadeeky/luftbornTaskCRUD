const _ = require("lodash");
const { User } = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { sendResponse } = require("../utils/sendResponse");
// const { sendEmail } = require("../utils/email");

const AppError = require("../utils/appError");

// Registers A New User To The Database.
module.exports.registerUser = catchAsync(async (req, res, next) => {
  console.log("Registering User", req.body);
  let body = _.pick(req.body, [
    "username",
    "name",
    "email",
    "password",
    "phone",
    "gender",
  ]);

  let user = new User(body);
  let savedUser = await user.save();

  if (savedUser) return sendResponse(res, 200, savedUser, "User Registered");
  return next(new AppError("Cannot create user", 422));
});

// Logs The User Into The System.
module.exports.loginUser = catchAsync(async (req, res, next) => {
  console.log("Logging In User", req.body);

  const email = req.body.email;
  if (!email) return next(new AppError("Please provide an email address", 401));

  const password = req.body.password;
  if (!password)
    return next(new AppError("Please provide a user password", 401));

  // Gets User With Provided Email.
  // TODO ------------- Handle Cannot Find User Error -------------
  const user = await User.findOne({ email: email });
  //  --  ---------------------------------------------------------

  // Checks Password Validity.
  user.comparePassword(password, (_, isMatch) => {
    if (!isMatch) return next(new AppError("Incorrect password", 422));
    // Creates Auth-Token For User.
    user.generateAuthToken();
    const token = user.getAuthToken();
    // Set The Auth Header
    res.header("x-auth", token);
    return sendResponse(res, 200, user, "Login successfully");
  });
});

// Edits User Profile, Either By ObjectID Or User's Email.
module.exports.editProfile = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  let body = _.pick(req.body, ["username", "name", "phone", "gender"]);
  // If Request Contains The ID As Parameter.
  if (req.params.id) {
    // Append The Email To The Update Body.
    body.email = email;
    var user = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    // Use Email As Key, Hence Cannot Be Updated.
  } else {
    if (!email)
      return next(new AppError("Please provide either _id or an email"));
    user = await User.findOneAndUpdate({ email: email }, body, {
      new: true,
    });
  }

  // Generate A New Auth-Token For The New User Data.
  user.generateAuthToken();
  const token = user.getAuthToken();
  // Set The Auth Header
  res.header("x-auth", token);
  return sendResponse(res, 200, user, "Login successfully");
});

// Fetches User Profile, Either By ObjectID Or User's Email.
module.exports.getUserProfile = catchAsync(async (req, res, next) => {
  if (req.params.id) {
    var user = await User.findById(req.params.id);
  } else {
    if (!req.body.email)
      return next(new AppError("Provide either _id or an email address", 422));
    user = await User.findOne({ email: req.body.email });
  }
  return sendResponse(res, 200, user, "User Retrieved");
});

// Fetches All Users In The System
module.exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  return sendResponse(res, 200, users, "Users Retrieved");
});

// module.exports.forgotPassword = catchAsync(async (req, res, next) => {
//   const email = req.body.email;
//   const user = await User.findOne({ email: email });
//   if (!user)
//     return next(new AppError("This email address does not exist", 400));
//   else {
//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false });

//     const resetURL = `${req.protocol}://${req.get(
//       "host"
//     )}/api/v1/users/resetPassword/${resetToken}`;

//     const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: "Your password reset token (valid for 10 min)",
//         message,
//       });
//       console.log("Trying");
//       res.status(200).json({
//         status: "success",
//         message: "Token sent to email!",
//       });
//     } catch (err) {
//       for (let i = 0; i < user.tokens.length; i++)
//         if (user.tokens[i].access === "reset-token") user.tokens.splice(i, 1);

//       await user.save({ validateBeforeSave: false });

//       return next(
//         new AppError(
//           "There was an error sending the email, try again later",
//           500
//         )
//       );
//     }
//   }
// });

// module.exports.sendMail = catchAsync(async (req, res, next) => {
//   const message = "Hey There";
//   const email = "hazemabdallah98@gmail.com";
//   const subject = "None";

//   try {
//     await sendEmail({
//       message,
//       email,
//       subject,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email!",
//     });
//   } catch (err) {
//     return next(err);
//   }
// });
