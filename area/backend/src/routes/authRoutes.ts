import express from "express";
import { registerUser, loginUser, googleLogin, googleCallback } from "../controllers/authController";
const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    await registerUser(req, res);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
    try {
      await loginUser(req, res);
    } catch (err) {
      next(err);
    }
  });

router.get("/google", googleLogin);

router.get("/google/callback", googleCallback);

export default router;
