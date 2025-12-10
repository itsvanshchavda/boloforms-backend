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
      default: [],
    },

    signedAt: {
      type: Date,
    },

    cloudinaryPublicId: {
      type: String,
    },

    isOriginal: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", DocumentSchema);

export default Document;
