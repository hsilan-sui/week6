const express = require("express");

const router = express.Router();

const { dataSource } = require("../db/data-source");
const { isNotValidString, isUndefined } = require("../utils/validUtils");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("Skill");
const handleErrorAsync = require("../utils/handleErrorAsync");

//路由請求邏輯處理
router.get(
  "/",
  handleErrorAsync(async (req, res, next) => {
    const skillRepo = dataSource.getRepository("Skill");

    const skillData = await skillRepo.find({
      select: ["id", "name", "createdAt"],
    });

    res.status(200).json({
      status: "success",
      data: skillData,
    });
  })
);

router.post(
  "/",
  handleErrorAsync(async (req, res, next) => {
    const { name } = req.body;
    //console.log(name);

    if (isUndefined(name) || isNotValidString(name)) {
      next(appError(400, "欄位未填寫正確"));
      return;
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
    }

    const skillRepo = dataSource.getRepository("Skill");

    //異步
    const existData = await skillRepo.find({
      where: {
        name,
      },
    });

    if (existData.length > 0) {
      next(appError(409, "資料重複"));
      return;
      // res.status(409).json({
      //   status: "failed",
      //   message: "資料重複",
      // });
    }

    const newSkill = skillRepo.create({
      name,
    });

    //異步 resul才是真正存進資料庫的資料
    const result = await skillRepo.save(newSkill);

    //防呆3：確保 `result` 不是 `null` 或 `undefined`
    //可能出現 資料庫連線失敗導致無法存入
    //可能誤寫 欄位資料錯誤 ex null
    if (!result || Object.keys(result).length === 0) {
      return res.status(500).json({
        status: "error",
        message: "資料存入失敗，請稍後再試",
      });
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  })
);

router.delete(
  "/:skillId",
  handleErrorAsync(async (req, res, next) => {
    const { skillId } = req.params;
    //防呆
    if (isUndefined(skillId) || isNotValidString(skillId)) {
      next(appError(400, "ID錯誤"));
      return;
      // res.status(400).json({
      //   status: "failed",
      //   message: "ID錯誤",
      // });
    }

    const skillRepo = dataSource.getRepository("Skill");

    const result = await skillRepo.delete(skillId);

    if (result.affected === 0) {
      next(appError(400, "ID錯誤"));
      return;
      // res.status(400).json({
      //   status: "failed",
      //   message: "ID錯誤",
      // });
    }

    res.status(200).json({
      status: "success",
    });
  })
);

//不要忘記這個
module.exports = router;
