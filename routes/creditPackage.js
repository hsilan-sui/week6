const express = require("express");

const router = express.Router();

const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");

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

//路由請求邏輯處理
router.get("/", async (req, res, next) => {
  try {
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    //發送sql查詢這裡才是異步
    const creditPackageData = await creditPackageRepo.find({
      // select: ["id", "name", "credit_amount", "price", "created_at"],
      select: ["id", "name", "credit_amount", "price", "createdAt"],
      //這裡的欄位不要寫錯 orm和資料庫欄位要對清楚
    });

    res.status(200).json({
      status: "success",
      data: creditPackageData,
    });
  } catch (error) {
    //使用logger
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
    //取的api請求送來的body資料
    const { name, credit_amount, price } = req.body;
    // 防呆1 檢查送來的資料
    if (
      isUndefined(name) ||
      isUndefined(credit_amount) ||
      isUndefined(price) ||
      isNotValidSting(name) ||
      isNotValidInteger(credit_amount) ||
      isNotValidInteger(price)
    ) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return; //忘記
    }

    //防呆2 資料庫有沒有重複的資料
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    //sql查詢 異步 findOne 查詢 單筆資料（可透過條件查詢）
    //這裡用find會比較好 方便
    const existData = await creditPackageRepo.find({
      where: { name },
    });
    //console.log("existData:", JSON.stringify(existData, null, 2));
    //有重複資料 find 回傳的是陣列 資料在這筆陣列中
    // existData: [
    //   {
    //     id: "d13bd642-959a-4593-96ee-e4909f21e3ff",
    //     name: "44344堂組合包方案",
    //     credit_amount: 4,
    //     price: "14000.00",
    //     createdAt: "2025-02-21T18:03:38.072Z",
    //   },
    // ];
    //console.log(existData); //findOne會回傳物件 無 ->null
    //當使用findOne 有重複資料時 他是回傳那筆資料物件
    //     existData: {
    //   "id": "d13bd642-959a-4593-96ee-e4909f21e3ff",
    //   "name": "44344堂組合包方案",
    //   "credit_amount": 4,
    //   "price": "14000.00",
    //   "createdAt": "2025-02-21T18:03:38.072Z"
    // }
    //這裡用find 所以這裡使用.length 有重複 要擋掉
    if (existData.length > 0) {
      res.status(409).json({
        status: "failed",
        message: "資料重複",
      });
      return;
    }

    //都過前面的關卡 才把使用者送來的body資料在該資料表中做創建的動作
    //create() 只是建立一個物件 不會執行sql指令不是異步
    const newPackage = creditPackageRepo.create({
      name,
      credit_amount,
      price,
    });
    //console.log(newPackage); //{ name: '2堂組合包方案', credit_amount: 2, price: 1400 }

    //.save() 會根據 是否有 id 來決定要新增.insert/create 還是更新.update
    //這裡沒有id 會是新增資料
    //會執行 SQL => INSERT INTO "credit_packages" ("name") VALUES ('fitness Package');
    const result = await creditPackageRepo.save(newPackage);

    //result長這樣物件
    //     {
    //   "name": "4444堂組合包方案",
    //   "credit_amount": 4,
    //   "price": 14000,
    //   "id": "9c8b0f76-7f63-4bdc-939c-1590f8dca2c5",
    //   "createdAt": "2025-02-21T17:59:08.198Z"
    // }

    //防呆3：確保 `result` 不是 `null` 或 `undefined`
    //可能出現 資料庫連線失敗導致無法存入
    //可能誤寫 欄位資料錯誤 ex null
    if (!result || Object.keys(result).length === 0) {
      return res.status(500).json({
        status: "error",
        message: "資料存入失敗，請稍後再試",
      });
    }
    // 輸出 result 確保資料正確
    //console.log("新建資料:", JSON.stringify(result, null, 2));
    //結果
    res.status(200).json({
      status: "success",
      data: result, //直接輸出result物件
    });
  } catch (error) {
    // res.status(500).json({
    //   status: "error",
    //   message: error.message || "伺服器錯誤",
    // });
    logger.error(error);
    next(error);
  }
});

router.delete("/:creditPackageId", async (req, res, next) => {
  try {
    //動態路由 取得刪除請求中的路由參數
    const { creditPackageId } = req.params;
    //console.log(creditPackageId);
    //防呆
    if (isUndefined(creditPackageId) || isNotValidSting(creditPackageId)) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }
    //建立typeorm creditPackageRepo 物件
    const creditPackageRepo = dataSource.getRepository("CreditPackage");

    //透過這個repo物件 對psql 做delete sql指令(異步)
    //執行 SQL DELETE 指令並回傳刪除結果，但 不會回傳被刪除的資料
    const result = await creditPackageRepo.delete(creditPackageId);
    // console.log("result", JSON.stringify(result, null, 2));
    // 執行成功result回傳的情況
    // result {
    //   "raw": [],
    //   "affected": 1 //受影響的資料數量（成功刪除的筆數）
    // }
    //這裡處理失敗的情況
    if (result.affected === 0) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      //data: result,
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

module.exports = router;
