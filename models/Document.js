import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
    },

    pdfUrl: {
      type: String,
    },

    originalPdfHash: {
      type: String,
    },

    signedPdfHash: {
      type: String,
    },

    fieldsData: {
      type: Array,
    },

    signedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", DocumentSchema);

export default Document;
