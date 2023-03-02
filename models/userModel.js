const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const SALT_WORK_FACTOR = 10;

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{Value} is an invalid email",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /01\d{9}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["male", "Male", "female", "Female"],
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
      expiry: {
        type: Number,
      },
    },
  ],
});

// Generates An Authentication Token Using JWT.
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const jwtSecretKey = `${process.env.JWT_SECRET_KEY}`;
  // The Type Of Access For The Generated Token.
  let access = "auth";

  // JWT Signs The Required User Data Using jwtSecretKey.
  const token = jwt
    .sign(
      {
        _id: user._id.toHexString(),
        name: user.name,
        username: user.username,
        access,
      },
      jwtSecretKey
    )
    .toString();

  // Generate A Token To Be Pushed In The User's Tokens Array.
  const userToken = {
    access,
    token,
  };

  // Checks & Replaces An Old Token With A New One.
  let replaced = false;
  for (let i = 0; i < user.tokens.length; i++) {
    if (user.tokens[i].access === "auth") {
      user.tokens.splice(i, 1, userToken);
      replaced = true;
      break;
    }
  }

  // If No Auth Token Have Been Generated Previously, Add It To The Array.
  if (!replaced) user.tokens.push(userToken);

  // ---------- Convert Funtion To Await --------------------
  // let fn = await user.save();

  // Save The User's New Token Data & Return The Token.
  await user.save();
  return token;
};

// Hashes The User's Password Prior Saving The User Data.
UserSchema.pre("save", function (next) {
  var user = this;
  // If User's Password Is Not Modified Do Not Hash It.
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    // Hash The Password Along With The Generated Salt.
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // Overrides The User Text Password With The Hashed One.
      user.password = hash;
      next();
    });
  });
});

// Runs Validators Before Saving Documents.
UserSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

UserSchema.pre("findByIdAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

// Compares The Clear Text Password With The Hashed One.
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// Returns The Authentication Token.
UserSchema.methods.getAuthToken = function () {
  const user = this;

  for (let i = 0; i < user.tokens.length; i++) {
    if (user.tokens[i].access === "auth") {
      return user.tokens[i].token;
    }
  }
  return "";
};

// Creates A Reset-Token For Forgotten Passwords.
UserSchema.methods.createPasswordResetToken = function () {
  let user = this;
  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  for (var i = 0; i < user.tokens.length; i++) {
    if (user.tokens[i].access === "reset-token") {
      user.tokens.splice(i, 1, passwordResetToken);
      break;
    }
  }

  if (i == user.tokens.length) {
    user.tokens.push({
      access: "reset-token",
      token: passwordResetToken,
      expiry: Date.now() + 10 * 60 * 1000,
    });
  }

  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
