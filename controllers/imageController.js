// controllers/imageController.js

import Image from "../models/imageModel.js";

// Fetch the single document containing the list of image URLs
export const fetchImages = async (req, res) => {
  try {
    const imageDoc = await Image.findOne().sort({ updatedAt: -1 }); // Get the latest document
    res.status(200).json(imageDoc ? imageDoc.urls : []); // Return the URLs or an empty array
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update the list of image URLs in a single document
export const updateImageOrder = async (req, res) => {
  try {
    const { urls } = req.body; // Array of image URLs

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: "Invalid image URLs provided" });
    }

    // Find the latest document or create a new one
    let imageDoc = await Image.findOne().sort({ updatedAt: -1 });

    if (!imageDoc) {
      imageDoc = new Image({ urls });
    } else {
      imageDoc.urls = urls;
      imageDoc.updatedAt = Date.now();
    }

    await imageDoc.save(); // Save the document

    res.status(200).json({ message: "Image order updated successfully", urls: imageDoc.urls });
  } catch (error) {
    console.error("Error updating image order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};