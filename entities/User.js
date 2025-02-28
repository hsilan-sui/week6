const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "USER",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 320,
      unique: true,
      nullable: false,
    },
    role: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 72,
      nullable: false,
      select: false, // 預設不會被查詢
      //查詢該資料表時，password 欄位不會出現在回傳結果
      //對於敏感資料（如密碼）建議使用 select: false
    },
    created_at: {
      type: "timestamp",
      createDate: true, //自動創建日期
      nullable: false,
    },
    update_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
  },
});
