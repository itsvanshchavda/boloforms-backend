import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Document from "./models/Document.js";
import uploadFile from "./utils/uploadFile.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_PDF_PATH = path.join(__dirname, "sample.pdf");

const seedSamplePdf = async () => {
  try {
    console.log("🌱 Starting PDF seeding process...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    const existingPdf = await Document.findOne({
      fileName: "sample.pdf",
      isOriginal: true,
    });

    if (existingPdf) {
      console.log("⚠️ Sample PDF already exists in database");
      console.log("📄 PDF ID:", existingPdf._id);
      console.log("🔗 Cloudinary URL:", existingPdf.pdfUrl);
      await mongoose.disconnect();
      return;
    }

    if (!fs.existsSync(SAMPLE_PDF_PATH)) {
      throw new Error(`PDF not found at ${SAMPLE_PDF_PATH}`);
    }

    const pdfBuffer = fs.readFileSync(SAMPLE_PDF_PATH);
    console.log(`✅ PDF loaded from: ${SAMPLE_PDF_PATH}`);
    console.log(`📦 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
    console.log(`🔐 PDF Hash: ${pdfHash}`);

    console.log("☁️ Uploading to Cloudinary...");
    const cloudinaryResult = await uploadFile(
      pdfBuffer,
      "sample.pdf",
      "bolo-pdfs",
      "pdf"
    );

    console.log(`✅ Uploaded to Cloudinary: ${cloudinaryResult.secure_url}`);

    const document = await Document.create({
      fileName: "sample.pdf",
      pdfUrl: cloudinaryResult.secure_url,
      originalPdfHash: pdfHash,
      signedPdfHash: null,
      fieldsData: [],
      cloudinaryPublicId: cloudinaryResult.public_id,
      signedAt: null,
      isOriginal: true,
    });

    console.log("\n🎉 SUCCESS! Sample PDF seeded to database");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📄 Document ID:", document._id);
    console.log("🔗 Cloudinary URL:", document.pdfUrl);
    console.log("🔐 Hash:", document.originalPdfHash);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    console.log("\n💡 Use this Document ID in your frontend/backend!");
  } catch (error) {
    console.error("❌ Error seeding PDF:", error);
    process.exit(1);
  }
};

seedSamplePdf();
