const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const { dataSource } = require("../db/data-source");
const { isNotValidString, isUndefined } = require("../utils/validUtils");
const appError = require("../utils/appError");
const { generateJWT } = require("../utils/jwtUtils");

const logger = require("../utils/logger")("User");

const saltRounds = 10;

// function isUndefined(value) {
//   return value === undefined;
// }

// function isNotValidString(value) {
//   return typeof value !== "string" || value.trim().length === 0 || value === "";
// }

//開發使用者
//[POST] 註冊使用者：{url}/api/users/signup
//[POST] 將使用者新增為教練：{url}/api/admin/coaches/:userId（要把 user role 改成 COACH ）

//使用者註冊
router.post("/signup", async (req, res, next) => {
  try {
    //  /..../表示正規表達式
    //.{8,16} 是 正則表達式中的量詞，用來限制字串長度
    // {最少, 最多}：匹配最少 8 個字元，最多 16 個字元
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
    //const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
    // {
    // "name" : "測試使用者",
    // "email" : "test@example.com",
    // "password" : "hexschool12345"
    // }
    //接收註冊資料
    const { name, email, password } = req.body;

    // 驗證必填欄位
    if (
      isUndefined(name) ||
      isNotValidString(name) ||
      isUndefined(email) ||
      isNotValidString(email) ||
      isUndefined(password) ||
      isNotValidString(password)
    ) {
      logger.warn("欄位未填寫正確");
      next(appError(400, "欄位未填寫正確"));
      return;
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
    }

    //驗證密碼規則
    //test() 是 正則表達式的內建方法，用來檢查字串是否匹配某個正則
    if (!passwordPattern.test(password)) {
      logger.warn(
        "建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
      );
      next(
        appError(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        )
      );
      return;
      // res.status(400).json({
      //   status: "failed",
      //   message:
      //     "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      // });

      // return;
    }

    //初始化User Repo物件
    const userRepository = dataSource.getRepository("User");

    //檢查email是否重複 透過findOne去查詢sql是否已存在這個email 回傳單筆物件
    const existUser = await userRepository.findOne({
      where: { email },
    });

    //該email使用者若存在
    if (existUser) {
      logger.warn("建立使用者錯誤: Email 已被使用");
      next(appError(409, "Email已被使用"));
      return;
      // res.status(409).json({
      //   status: "failed",
      //   message: "Email已被使用",
      // });

      // return;
    }

    //開始準備建立使用者註冊資料
    //加密使用者密碼
    const hashPassword = await bcrypt.hash(password, saltRounds);

    //建立orm 使用者註冊物件
    const newUser = userRepository.create({
      name,
      email,
      role: "USER",
      password: hashPassword,
    });

    //將該使用者物件資料 存入資料庫
    const savedUser = await userRepository.save(newUser);
    logger.info("新建立的使用者ID:", savedUser.id);
    //回傳201 使用者id和name
    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: savedUser.id,
          name: savedUser.name,
        },
      },
    });
  } catch (error) {
    logger.error("建立使用者錯誤:", error);
    next(error);
  }
});

//使用者登入
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //isNotValidString, isUndefined
    if (
      isNotValidString(email) ||
      isNotValidString(password) ||
      isUndefined(email) ||
      isUndefined(password)
    ) {
      logger.warn("欄位未填寫正確");
      next(appError(400, "欄位未填寫正確"));
      return;
    }

    //驗證密碼格式
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;

    if (!passwordPattern.test(password)) {
      logger.warn(
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
      );
      next(
        appError(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        )
      );

      return;
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      select: ["id", "name", "password"],
      where: { email },
    });

    if (!findUser) {
      logger.warn("使用者不存在或密碼輸入錯誤");
      next(appError(400, "使用者不存在或密碼輸入錯誤"));
      return;
    }

    //
    logger.info(`使用者資料：${JSON.stringify(findUser)}`);

    // 比對使用者請求傳送過來的密碼 是否與 資料庫一致
    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      logger.warn("使用者不存在或密碼輸入錯誤");
      next(appError(400, "使用者不存在或密碼輸入錯誤"));
      return;
    }

    // TODO JWT
    //產生token
    const token = generateJWT({
      id: findUser.id,
      role: findUser.role,
    });
    //成功回傳響應
    res.status(201).json({
      status: "success",
      data: {
        token,
        user: {
          name: findUser.name,
        },
      },
    });
  } catch (error) {
    logger.error("登入錯誤：", error);
    next(error);
  }
});

module.exports = router;
