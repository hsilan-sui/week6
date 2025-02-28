const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Skill",
  tableName: "SKILL",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid", //自動創建uuid
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true, //自動創建日期
      name: "created_at", //在資料庫顯示的名稱
      nullable: false,
    },
  },
});
