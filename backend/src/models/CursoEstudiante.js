import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CursoEstudiante = sequelize.define(
  "CursoEstudiante",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_curso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cursos",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    id_estudiante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",   // Tu tabla real
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "curso_estudiante",
    timestamps: true,
  }
);

export default CursoEstudiante;
