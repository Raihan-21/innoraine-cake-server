const { sequelize } = require("../database/admin");

const { DataTypes } = require("sequelize");

const kategori = sequelize.define(
  "kategori",
  {
    id: {
      type: DataTypes.TINYINT,
      primaryKey: true,
    },
    created_at: { type: DataTypes.TIME, allowNull: false },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { freezeTableName: true, createdAt: false, updatedAt: false }
);

module.exports = kategori;
