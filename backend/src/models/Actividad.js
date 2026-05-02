import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Actividad = sequelize.define(
  "Actividad",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    tipo: {
      type: DataTypes.STRING,
      allowNull: false, 
      // ejemplo: "taller", "parcial", "exposición"
    },

    porcentaje: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },

    id_curso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cursos",
        key: "id",
      },
    },
  },
  {
    tableName: "actividades",
    timestamps: true,
  }
);

export default Actividad;
