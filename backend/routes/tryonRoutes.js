const express = require('express');
const router = express.Router();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/', async (req, res) => {
  try {
    const { userImageBase64, garmentImageUrl } = req.body;

    if (!userImageBase64 || !garmentImageUrl) {
      return res.status(400).json({ message: 'Missing user image or garment image.' });
    }

    const API_KEY = process.env.REPLICATE_API_TOKEN;

    if (!API_KEY) {
      console.log('No REPLICATE_API_TOKEN found. Simulating AI processing...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      return res.status(200).json({
        success: true,
        resultUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
      });
    }

    // 1. Upload user's photo to Cloudinary to get a public URL
    // (Replicate requires public image URLs, not base64)
    console.log("Uploading person image to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(userImageBase64, {
      folder: 'cura-tryon',
      resource_type: 'image'
    });
    const personImageUrl = uploadResult.secure_url;
    console.log("Person image uploaded:", personImageUrl);

    // 2. Call Replicate with cedoysch/flux-fill-redux-try-on
    console.log("Sending request to Replicate AI...");
    const predictionResponse = await axios.post('https://api.replicate.com/v1/predictions', {
      version: "cf5cb07a25e726fe2fac166a8c5ab52ddccd48657741670fb09d9954d4d8446f",
      input: {
        person_image: personImageUrl,
        cloth_image: garmentImageUrl,
        cloth_type: "upper",
        output_format: "jpg",
        output_quality: 95
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let prediction = predictionResponse.data;
    const getUrl = prediction.urls.get;

    // 3. Poll for the result
    console.log(`Prediction started: ${prediction.id}. Polling...`);
    let attempts = 0;
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      const statusRes = await axios.get(getUrl, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      prediction = statusRes.data;
      console.log(`Poll ${attempts}: ${prediction.status}`);
    }

    if (prediction.status === "failed") {
      throw new Error(prediction.error || "Replicate AI processing failed.");
    }
    if (prediction.status !== "succeeded") {
      throw new Error("Processing timed out.");
    }

    // 4. Return the result
    const resultUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!resultUrl) throw new Error("No output image returned.");

    console.log("AI Generation successful!");
    return res.status(200).json({ success: true, resultUrl });

  } catch (error) {
    console.error('Virtual Try-On Error:', error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data?.detail || error.message || 'AI processing failed.' });
  }
});

module.exports = router;


