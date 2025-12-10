import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { PassThrough } from "stream";

dotenv.config({ quiet: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = (buffer, filename = "newfile.pdf", folder, format) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: folder,
        overwrite: true,
        invalidate: true,
        public_id: filename.replace(/\.pdf$/i, ""),
        format: format || "pdf",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readable = new PassThrough();
    readable.end(buffer);
    readable.pipe(uploadStream);
  });

export default uploadFile;
