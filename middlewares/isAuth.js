//middleware
//const app = require("../app");
const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { verifyJWT } = require("../utils/jwtUtils");
const logger = require("../utils/logger")("isAuth");

//在使用者登入時會需要驗證
const isAuth = async (req, res, next) => {
  try {
    //Authorization: Bearer xxxxxxx.yyyyyyy.zzzzzzz
    //確認token 是否存在並取出token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      next(appError(401, "你尚未登入"));
      return;
    }

    //取的token xxxxxxx.yyyyyyy.zzzzzzz
    const token = authHeader.split(" ")[1];

    //驗證token
    const decoded = await verifyJWT(token);
    // {
    //   id: findUser.id,
    //   role: findUser.role,
    // }

    //如果正確
    //去資料庫尋找對應id的使用者
    //401 "無效的token"
    const currentUser = await dataSource.getRepository("User").findOne({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      next(appError(401, "無效token"));
      return;
    }

    //存入user
    req.user = currentUser;
    /****我就是忘記加了這個 postman卡住*****/
    next();
  } catch (error) {
    logger.error(error.message);
    next(error);
  }
};

module.exports = isAuth;
