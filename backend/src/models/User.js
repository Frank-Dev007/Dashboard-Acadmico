import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    correo: DataTypes.STRING,
    password: DataTypes.STRING,
    documento: DataTypes.STRING,
    tipo_usuario: DataTypes.STRING,
    facultad: DataTypes.STRING,
    programa: DataTypes.STRING,
    estado: DataTypes.BOOLEAN
  },
  {
    tableName: "usuarios", // ← USAR LA TABLA REAL
    timestamps: true
  }
);

export default User;
