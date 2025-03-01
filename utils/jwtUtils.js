const jwt = require("jsonwebtoken");
const config = require("../config/index");
const appError = require("./appError");
const app = require("../app");

//產生jwt token

const generateJWT = (payload) => {
  return jwt.sign(payload, config.get("secret.jwtSecret"), {
    expiresIn: config.get("secret.jwtExpiresDay"),
  });
};
// jwtSecret: process.env.JWT_SECRET,
//   jwtExpiresDay: process.env.JWT_EXPIRES_DAY,

//驗證jwttoken
const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.get("secret.jwtSecret"), (err, decoded) => {
      if (err) {
        //reject(err);
        switch (err.name) {
          case "TokenExpiredError":
            return reject(appError(401, "Token已過期"));
          //break;
          default:
            return reject(appError(401, "無效的token"));
        }
      } else {
        resolve(decoded);
      }
    });
  });
};
module.exports = {
  generateJWT,
  verifyJWT,
};
