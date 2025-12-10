import Document from "../models/Document.js";

export const getPdf = async (req, res) => {
  try {
    const document = await Document.findOne({ isOriginal: true });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Signed PDF not found.",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("❌ Error fetching signed PDF:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
      message: error.message,
    });
  }
};

export default getPdf;
