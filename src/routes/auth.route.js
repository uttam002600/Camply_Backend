import { Router } from "express";
import {
  googleLogin,
  logout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = Router();

router.route("/google-login").post(googleLogin);
router.route("/logout").post(logout);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify").get(authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
