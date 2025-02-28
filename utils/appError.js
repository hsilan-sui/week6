//建立error物件
const appError = (status, errMsg, next) => {
  const error = new Error(errMsg);
  error.status = status;
  return error;
};

module.exports = appError;
