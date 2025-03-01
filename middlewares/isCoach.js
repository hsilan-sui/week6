const appError = require("../utils/appError");

module.exports = (req, res, next) => {
  //401 尚未成為教練
  if (!req.user || req.user.role !== "COACH") {
    next(appError(401, "使用者尚未成為教練"));
    return;
  }

  //**************一定要記得加上 next()控制權 ************** */
  next();
};
