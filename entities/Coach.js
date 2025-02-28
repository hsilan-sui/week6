const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Coach",
  tableName: "COACH",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    user_id: {
      //外鍵
      type: "uuid",
      unique: true,
      nullable: false,
    },
    experience_years: {
      type: "integer",
      nullable: false,
    },
    description: {
      type: "text",
      //nullable: true,
      nullable: false,
    },
    profile_image_url: {
      //圖片
      type: "varchar",
      length: 2048,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      nullable: false,
    },
  }, //建立兩張表的關聯
  //有沒有需要在User也建立
  relations: {
    User: {
      target: "User",
      type: "one-to-one",
      inverseSide: "Coach",
      joinColumn: {
        name: "user_id",
        referenceColumnName: "id",
        //如果沒有指定 foreignKeyConstraintName，TypeORM 會自動產生隨機名稱，未來就難以管理
        foreignKeyConstrainName: "coach_user_id_fk",
        //SQL 層級的設定，用來設定「這條外鍵的約束名稱 (constraint name)
        // ALTER TABLE COACH
        // ADD CONSTRAINT coach_user_id_fk
        // FOREIGN KEY (user_id) REFERENCES USER(id);
        // user_id 只能參考 USER 表的 id
        // 不能隨便刪除 USER.id，否則會影響 COACH.user_id
        // 這條約束的名稱是 "coach_user_id_fk"
      },
    },
  },
});

//關於這段
//這樣就讓 TypeORM 知道兩個表如何關聯，在查詢時自動轉換成 INNER JOIN
//relations: {
//     User: {
//       target: 'User',
//       type: 'one-to-one',
//       inverseSide: 'Coach',
//       joinColumn: {
//COACH 表中的外鍵欄位 (COACH.user_id)
//         name: 'user_id',
//這個外鍵對應 USER 表的 id
//         referencedColumnName: 'id',
//設定 SQL 外鍵約束名稱，防止刪除 USER.id 造成 COACH.user_id 變成無效值
//         foreignKeyConstraintName: 'coach_user_id_fk'
//       }
//     }
//   }

//inner join觀念
// == sql ===
//INNER JOIN 會回傳 兩個表中都有對應資料的紀錄，如果 Coach.user_id 沒有對應的 User.id，那麼這筆資料不會被返回

// SELECT
//     COACH.id AS coach_id, //教練id
//     COACH.user_id,
//     COACH.experience_years,
//     USER.id AS user_id, //使用者id
//     USER.name,
//     USER.email
// FROM COACH
// INNER JOIN USER ON COACH.user_id = USER.id;
//關聯USER這帳資料表 在COACH.user_id = USER.id 條件上

// === inner join 在 typeorm ===
//TypeORM 會幫我們自動產生 INNER JOIN，只要我們在 relations 加入 "User"

//假如typeorm這樣做
//const coach = await getRepository("Coach").findOne({
//   where: { id: "some-coach-id" },
//   relations: ["User"]
// });

//等於sql指令是
// SELECT
//     COACH.id AS coach_id,
//     COACH.user_id,
//     COACH.experience_years,
//     USER.id AS user_id,
//     USER.name,
//     USER.email
// FROM COACH
// INNER JOIN USER ON COACH.user_id = USER.id
// WHERE COACH.id = 'some-coach-id';

//這樣 coach.User 會包含 User 的完整資料
// {
//   "id": "1a2b3c",
//   "user_id": "123e4567",
//   "experience_years": 5,
//   "User": {
//     "id": "123e4567",
//     "name": "Alice",
//     "email": "alice@mail.com"
//   }
// }

//@JoinColumn 和 inverseSide 影響的 INNER JOIN
