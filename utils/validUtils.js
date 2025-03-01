//防呆函式
const isNotValidString = (value) => {
  return typeof value !== "string" && value.trim() === "";
};

const isNotValidInteger = (value) => {
  return typeof value !== "number" || value < 0 || value % 1 !== 0;
};

const isUndefined = (value) => {
  return value === undefined;
};

module.exports = {
  isNotValidString,
  isNotValidInteger,
  isUndefined,
};
// function isUndefined(value) {
//   return value === undefined;
// }

// function isNotValidSting(value) {
//   return typeof value !== "string" || value.trim().length === 0 || value === "";
// }

// function isNotValidInteger(value) {
//   return typeof value !== "number" || value < 0 || value % 1 !== 0;
// }
