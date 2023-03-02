module.exports.sendResponse = (res, status, payload, msg) => {
  return res.status(status).send({
    message: msg,
    data: payload,
  });
};
