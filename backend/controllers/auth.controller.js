import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { nanoid } from "nanoid";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { fetchGeolocation } from "../utils/fetchGeolocation.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";
import { Url } from "../models/url.model.js";

export const shortenUrl = async (req, res) => {
	try {
		const { url } = req.body;
		if (!url) return res.status(400).json({ error: 'URL is required' });

		const shortUrl = nanoid(7);
		const newUrl = new Url({ originalUrl: url, shortUrl });

		await newUrl.save();
		res.json({ shortUrl: `/logger/${shortUrl}` });
	} catch (error) {
		console.error('Error generating short URL:', error);
		res.status(500).json({ error: 'Server error' });
	}
};

export const getOriginalUrl = async (req, res) => {
		const { shortUrl } = req.params;
		const url = await Url.findOne({ shortUrl });
		if (!url) return res.status(404).json({ error: "URL not found" });

		// Log visitor details
		const visitorIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		url.visits.push({ ip: visitorIp });
		await url.save();

		res.json({ originalUrl: url.originalUrl });
};

export const getLogs = async (req, res) => {
		const { shortUrl } = req.params;
		try {
				const url = await Url.findOne({ shortUrl }).select('originalUrl shortUrl visits');
				if (!url) return res.status(404).json({ error: 'URL not found' });

				const visitsWithGeoInfo = await Promise.all(url.visits.map(async (visit) => {
						const visitorIp = visit.ip.split(',')[0].trim(); // Extract the public IP address
						const geolocationData = await fetchGeolocation(visitorIp);
						return {
								...visit.toObject(),
								...geolocationData
						};
				}));

				res.json({ ...url.toObject(), originalUrl: url.originalUrl,
					shortUrl: url.shortUrl,
					newUrl: `${req.protocol}://${req.get('host')}/${url.shortUrl}`,
					loggerUrl: `${req.protocol}://${req.get('host')}/logger/${url.shortUrl}`, visits: visitsWithGeoInfo });
		} catch (error) {
				console.error('Error fetching logs:', error);
				res.status(500).json({ error: 'Server error' });
		}
};

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const updateTime = async (req, res) => {
	try {
		const userId = req.userId; // Assuming you have authentication middleware to get the user ID
		const { time } = req.body;

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ time },
			{ new: true } // Return the updated document
		);

		res.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error('Error updating time:', error);
		res.status(500).json({ success: false, message: 'Failed to update time' });
	}
};