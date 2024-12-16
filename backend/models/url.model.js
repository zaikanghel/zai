
import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
		ip: String,
		timestamp: { type: Date, default: Date.now },
});

const urlSchema = new mongoose.Schema({
		originalUrl: { type: String, required: true },
		shortUrl: { type: String, required: true, unique: true },
		visits: [visitSchema],
});

export const Url = mongoose.model("Url", urlSchema);