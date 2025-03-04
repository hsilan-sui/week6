const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("User");
const handleErrorAsync = require("../utils/handleErrorAsync");

// 取得教練列表 API
router.get(
  "/",
  handleErrorAsync(async (req, res, next) => {
    let { per, page } = req.query;
    per = parseInt(per) || 9; // 預設每頁 9 筆
    page = parseInt(page) || 1; // 預設第一頁

    if (per <= 0 || page <= 0) {
      return next(appError(400, "查詢的資料筆數與頁數格式必須是正數"));
    }

    const skipData = (page - 1) * per;
    const coachesRepo = dataSource.getRepository("Coach");
    //select
    // COACH.id as coach_id,
    // USER.name as user_name
    //FROM COACH
    //left join user on coach.user_id = user.id
    //order by coach.id ASC
    //left 9 offset 0
    // const coaches = await coachesRepo.find({
    //   take: per,
    //   skip: skipData,
    //   order: { id: "ASC" },
    // });

    //使用QueryBuilder 只選擇coach.id和user_id ==> name
    // const queryBuilder = coachesRepo
    //   .createQueryBuilder("coach")
    //   .leftJoin("User", "user", "coach.user_id = user.id") // 手動 JOIN
    //   .select(["coach.id AS id", "user.name AS name"])
    //   .orderBy("coach.id", "ASC")
    //   .skip(skipData)
    //   .take(per);
    const queryBuilder = coachesRepo
      .createQueryBuilder("coach")
      //.leftJoin("要連結的資料表的名稱", "別名alias", "集合 JOIN 條件 coach.user_id = user.id")
      //對應SELECT *
      // FROM COACH AS coach
      // LEFT JOIN USER AS user ON coach.user_id = user.id;
      .leftJoin("User", "user", "coach.user_id = user.id")
      //指定我們要選取哪些欄位
      .select(["coach.id AS id", "user.name AS name"])
      .orderBy("coach.id", "ASC")
      .offset(skipData) // 確保分頁生效 分頁跳過筆數
      .limit(per);

    console.log("queryBuilder", queryBuilder);
    //陣列 裡面包每筆教練物件資料 （執行查詢並取得資料）
    //.getRawMany()執行 SQL 查詢，並回傳一個包含多筆資料的陣列
    const coachesData = await queryBuilder.getRawMany();
    // coachesData[
    //   ({ id: "578af7c5-0783-4710-8b44-151b166154ae", name: "ttt" },
    //   { id: "5b7dceac-2798-43c2-bd18-226053e8c51a", name: "tt" },
    //   { id: "8d853ce6-feae-4312-9728-551cd5fa3277", name: "小美" },
    //   { id: "c5da7701-bc52-45d8-a03e-737eb3613b53", name: "test" },
    //   { id: "e7788327-d492-4596-8c05-0c33c5f8775a", name: "s" })
    // ];
    //console.log("coachesData", coachesData);

    res.status(200).json({
      status: "success",
      //   per,
      //   page,
      data: coachesData,
    });
  })
);

module.exports = router;
