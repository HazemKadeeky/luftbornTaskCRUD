const AppError = require("../utils/appError");

const handleDuplicateFieldDB = (err) => {
  const keyValue = err.keyValue;
  const value = keyValue[Object.keys(keyValue)[0]];
  const message = `Duplicate field value: '${value}', Please use another value`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid Token Please Login Again", 401);

const handleJWTExpiredError = () => new AppError("Your Token has expired", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (`${process.env.NODE_ENV}` === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };

    switch (error.name) {
      case "JsonWebTokenError":
        error = handleJWTError();
        break;
      case "TokenExpiredError":
        error = handleJWTExpiredError();
        break;
    }

    switch (error.code) {
      case 11000:
        error = handleDuplicateFieldDB(err);
        break;
    }
    sendErrorProd(error, res);
  }
};
