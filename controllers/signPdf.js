import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import convertPdf from "./convertPdf.js";
import uploadFile from "../utils/uploadFile.js";
import Document from "../models/Document.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_PDF_PATH = path.join(__dirname, "..", "sample.pdf");

const signPdf = async (req, res) => {
  try {
    const { fields } = req.body;

    if (!fields || fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields provided for signing.",
      });
    }

    if (!fs.existsSync(SAMPLE_PDF_PATH)) {
      return res.status(404).json({
        success: false,
        error: "Sample PDF not found. Please add a PDF file at sample.pdf",
      });
    }

    const pdfBuffer = fs.readFileSync(SAMPLE_PDF_PATH);

    const originalHash = crypto
      .createHash("sha256")
      .update(pdfBuffer)
      .digest("hex");

    const signedPdfBytes = await convertPdf(pdfBuffer, fields);

    const signedHash = crypto
      .createHash("sha256")
      .update(Buffer.from(signedPdfBytes))
      .digest("hex");

    const signedFileName = `signed_${Date.now()}_sample.pdf`;
    const cloudinaryResult = await uploadFile(
      Buffer.from(signedPdfBytes),
      signedFileName,
      "signed-pdfs",
      "pdf"
    );

    const signedDocument = await Document.findOneAndUpdate(
      { isOriginal: true },
      {
        fileName: signedFileName,
        pdfUrl: cloudinaryResult.secure_url,
        originalPdfHash: originalHash,
        signedPdfHash: signedHash,
        fieldsData: fields,
        cloudinaryPublicId: cloudinaryResult.public_id,
        signedAt: new Date(),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "PDF signed successfully",
      document: signedDocument,
    });
  } catch (error) {
    console.error("❌ Error signing PDF:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
      message: error.message,
    });
  }
};

export default signPdf;
