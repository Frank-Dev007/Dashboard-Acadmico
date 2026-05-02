import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById
} from "../controllers/user.controller.js";

const router = Router();

// Obtener todos los usuarios
router.get("/", getUsers);

// Obtener usuario por ID
router.get("/:id", getUserById);

// Crear usuario
router.post("/", createUser);

// Actualizar usuario
router.put("/:id", updateUser);

// Eliminar usuario
router.delete("/:id", deleteUser);

export default router;
