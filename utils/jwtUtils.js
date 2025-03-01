const jwt = require("jsonwebtoken");
const config = require("../config/index");
const appError = require("./appError");

//產生jwt token

const generateJWT = (payload) => {
  return jwt.sign(payload, config.get("secret.jwtSecret"), {
    expiresIn: config.get("secret.jwtExpiresDay"),
  });
};
// jwtSecret: process.env.JWT_SECRET,
//   jwtExpiresDay: process.env.JWT_EXPIRES_DAY,
module.exports = {
  generateJWT,
};
