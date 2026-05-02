import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Nota = sequelize.define(
  "Nota",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_estudiante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },

    id_actividad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "actividades",
        key: "id",
      },
    },

    nota: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    tableName: "notas",
    timestamps: true,
  }
);

export default Nota;
