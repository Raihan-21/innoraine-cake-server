const { sequelize } = require("../database/admin");
const { DataTypes } = require("sequelize");
const kategori = require("./Category");

const Produk = sequelize.define(
  "produk",
  {
    //   id: { type: DataTypes.TINYINT, primaryKey: true },
    created_at: { type: DataTypes.TIME, allowNull: false },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_kategori: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    harga: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  { freezeTableName: true, createdAt: false, updatedAt: false }
);

Produk.belongsTo(kategori, { foreignKey: "id_kategori" });

module.exports = Produk;
