import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Curso = sequelize.define(
  "Curso",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_profesor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",  // <-- tabla real en MySQL
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    semestre: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    grupo: {
      type: DataTypes.INTEGER, // tus grupos son númericos (1,2,3…)
      allowNull: false,
    },
  },
  {
    tableName: "cursos", // <-- nombre REAL de la tabla
    timestamps: true,
  }
);

export default Curso;
