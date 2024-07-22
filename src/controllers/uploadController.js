import { bucket } from "../services/firebase.js";
import { v4 as uuidv4 } from "uuid";

const uploadPicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const file = req.file;
  const fileName = `${uuidv4()}-${file.originalname}`;

  try {
    const fileUpload = bucket.file(fileName);
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      console.error("Blob stream error:", error);
      res.status(500).json({ message: "Unable to upload picture", error });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      res
        .status(200)
        .json({ message: "Picture uploaded successfully", url: publicUrl });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export { uploadPicture };
