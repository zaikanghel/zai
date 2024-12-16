import express from "express";
import {
	login,
	logout,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	updateTime,
	shortenUrl,
	getOriginalUrl,
	getLogs,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.put('/update-time', verifyToken, updateTime);

router.post("/shorten", shortenUrl);
router.get("/:shortUrl", getOriginalUrl);
router.get("/logs/:shortUrl", getLogs);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
