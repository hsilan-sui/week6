const express = require("express");

const router = express.Router();

const { dataSource } = require("../db/data-source");

const logger = require("../utils/logger")("Skill");

//防呆函式
function isUndefined(value) {
  return value === undefined;
}

function isNotValidSting(value) {
  return typeof value !== "string" || value.trim().length === 0 || value === "";
}

function isNotValidInteger(value) {
  return typeof value !== "number" || value < 0 || value % 1 !== 0;
}

// res.status(200).json({
//   status: "success",
//   data: creditPackageData,
// });
//路由請求邏輯處理
router.get("/", async (req, res, next) => {
  try {
    const skillRepo = dataSource.getRepository("Skill");

    const skillData = await skillRepo.find({
      select: ["id", "name", "createdAt"],
    });

    res.status(200).json({
      status: "success",
      data: skillData,
    });
  } catch (error) {
    logger.error(error);
    next(error);
    // res.status(500).json({
    //   status: "error",
    //   message: error.message || "伺服器錯誤",
    // });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    //console.log(name);

    if (isUndefined(name) || isNotValidSting(name)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const skillRepo = dataSource.getRepository("Skill");

    //異步
    const existData = await skillRepo.find({
      where: {
        name,
      },
    });

    if (existData.length > 0) {
      res.status(409).json({
        status: "failed",
        message: "資料重複",
      });
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
  } catch (error) {
    logger.error(error);
    next(error);
    // res.status(500).json({
    //   status: "error",
    //   message: error.message || "伺服器錯誤",
    // });
  }
});

router.delete("/:skillId", async (req, res, next) => {
  try {
    const { skillId } = req.params;
    //防呆
    if (isUndefined(skillId) || isNotValidSting(skillId)) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    const skillRepo = dataSource.getRepository("Skill");

    const result = await skillRepo.delete(skillId);

    if (result.affected === 0) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    logger.error(error);
    next(error);
    // res.status(500).json({
    //   status: "error",
    //   message: error.message || "伺服器錯誤",
    // });
  }
});

//不要忘記這個
module.exports = router;
