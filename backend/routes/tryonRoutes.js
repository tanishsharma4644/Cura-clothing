const express = require('express');
const router = express.Router();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @desc  Utility: Sleep for a given number of milliseconds.
 * Used for exponential backoff in polling and retry logic.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @desc  Utility: Retry an async function with exponential backoff.
 * @param {Function} fn - The async function to retry.
 * @param {number} retries - Max number of retries.
 * @param {number} delay - Initial delay in ms (doubles each attempt).
 */
const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // Do not retry on 4xx client errors — only 5xx server/network errors
      if (err.response?.status >= 400 && err.response?.status < 500) throw err;
      if (attempt === retries) throw err;

      const backoffDelay = delay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.warn(`Attempt ${attempt} failed. Retrying in ${backoffDelay}ms...`);
      await sleep(backoffDelay);
    }
  }
};

/**
 * @route   POST /api/tryon
 * @desc    AI Virtual Try-On — uploads user photo to Cloudinary,
 *          submits to Replicate AI, polls for completion with exponential backoff.
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { userImageBase64, garmentImageUrl } = req.body;

    // ── Input Validation ───────────────────────────────────────────────────────
    if (!userImageBase64) {
      return res.status(400).json({ success: false, message: 'User image is required.' });
    }
    if (!garmentImageUrl) {
      return res.status(400).json({ success: false, message: 'Garment image URL is required.' });
    }
    // Validate that the garment URL is a proper absolute URL
    try {
      new URL(garmentImageUrl);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid garment image URL format.' });
    }

    const API_KEY = process.env.REPLICATE_API_TOKEN;

    // ── Demo Mode (no API key configured) ─────────────────────────────────────
    if (!API_KEY) {
      console.log('[TryOn] No REPLICATE_API_TOKEN found. Running in demo simulation mode...');
      await sleep(3000); // Simulate processing time
      return res.status(200).json({
        success: true,
        mode: 'demo',
        resultUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      });
    }

    // ── Step 1: Upload User Photo to Cloudinary ────────────────────────────────
    // Replicate requires public image URLs — base64 is not supported directly.
    console.log('[TryOn] Uploading user photo to Cloudinary CDN...');
    let personImageUrl;
    try {
      const uploadResult = await retryWithBackoff(() =>
        cloudinary.uploader.upload(userImageBase64, {
          folder: 'cura-tryon',
          resource_type: 'image',
        })
      );
      personImageUrl = uploadResult.secure_url;
      console.log('[TryOn] Cloudinary upload successful:', personImageUrl);
    } catch (uploadErr) {
      console.error('[TryOn] Cloudinary upload failed:', uploadErr.message);
      return res.status(502).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
        error: 'UPLOAD_FAILED',
      });
    }

    // ── Step 2: Submit Prediction to Replicate AI ──────────────────────────────
    console.log('[TryOn] Submitting prediction to Replicate AI...');
    let prediction;
    try {
      const predictionResponse = await retryWithBackoff(() =>
        axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: 'cf5cb07a25e726fe2fac166a8c5ab52ddccd48657741670fb09d9954d4d8446f',
            input: {
              person_image: personImageUrl,
              cloth_image: garmentImageUrl,
              cloth_type: 'upper',
              output_format: 'jpg',
              output_quality: 95,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout for initial request
          }
        )
      );
      prediction = predictionResponse.data;
    } catch (replicateErr) {
      const status = replicateErr.response?.status;
      console.error('[TryOn] Replicate submission failed:', replicateErr.response?.data || replicateErr.message);

      // Provide specific error messages based on HTTP status codes
      if (status === 401) {
        return res.status(502).json({ success: false, message: 'Invalid AI API key. Please contact support.', error: 'AUTH_FAILED' });
      }
      if (status === 402) {
        return res.status(402).json({ success: false, message: 'AI service quota exceeded. Please try again later.', error: 'QUOTA_EXCEEDED' });
      }
      if (status === 422) {
        return res.status(400).json({ success: false, message: 'Invalid input parameters for AI model.', error: 'INVALID_INPUT' });
      }
      return res.status(503).json({ success: false, message: 'AI service is temporarily unavailable. Please try again.', error: 'SERVICE_UNAVAILABLE' });
    }

    // ── Step 3: Poll for Result with Exponential Backoff ──────────────────────
    const getUrl = prediction.urls.get;
    let attempts = 0;
    const MAX_ATTEMPTS = 30;
    let pollDelay = 2000; // Start at 2s, max out at 8s

    console.log(`[TryOn] Prediction started (ID: ${prediction.id}). Polling for result...`);

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < MAX_ATTEMPTS) {
      await sleep(pollDelay);
      pollDelay = Math.min(pollDelay * 1.2, 8000); // Gradually increase poll interval, cap at 8s
      attempts++;

      const statusRes = await axios.get(getUrl, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      prediction = statusRes.data;
      console.log(`[TryOn] Poll ${attempts}/${MAX_ATTEMPTS}: status=${prediction.status}`);
    }

    // ── Step 4: Handle Final Status ────────────────────────────────────────────
    if (prediction.status === 'failed') {
      const errorDetail = prediction.error || 'The AI model failed to process the image.';
      console.error('[TryOn] Prediction failed:', errorDetail);
      return res.status(500).json({ success: false, message: errorDetail, error: 'AI_PROCESSING_FAILED' });
    }

    if (prediction.status !== 'succeeded') {
      return res.status(504).json({ success: false, message: 'AI processing timed out. The image may be too complex.', error: 'TIMEOUT' });
    }

    // ── Step 5: Return Result ──────────────────────────────────────────────────
    const resultUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!resultUrl) {
      return res.status(500).json({ success: false, message: 'AI generation succeeded but returned no image.', error: 'EMPTY_OUTPUT' });
    }

    console.log('[TryOn] ✅ AI Generation successful!');
    return res.status(200).json({ success: true, resultUrl });

  } catch (error) {
    // Catch-all for any unexpected errors
    console.error('[TryOn] Unexpected error:', error.message);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
});

module.exports = router;
