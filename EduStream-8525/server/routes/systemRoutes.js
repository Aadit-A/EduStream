const express = require("express");
const { Readable } = require("stream");
const os = require("os");
const router = express.Router();
/**
 * GET /system/health
 * Demonstrates Node.js runtime process inspection, uptime, and memory usage
 */
router.get("/health", (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      rssMb: (memory.rss / 1024 / 1024).toFixed(2),
      heapTotalMb: (memory.heapTotal / 1024 / 1024).toFixed(2),
      heapUsedMb: (memory.heapUsed / 1024 / 1024).toFixed(2),
    },
  });
});
/**
 * GET /system/syllabus/stream-demo
 * Demonstrates Node.js Buffers, Streams (Readable), and HTTP headers
 * Creates an in-memory binary Buffer, transforms it into a readable stream, and pipes to HTTP response
 */
router.get("/syllabus/stream-demo", (req, res) => {
  const reportPayload = {
    institution: "EduStream LMS",
    generatedBy: "Member 1 — Node.js & Express Engineering",
    nodeEngine: process.version,
    systemArchitecture: os.arch(),
    generatedAt: new Date().toISOString(),
    syllabusVerified: [
      "CommonJS Modules",
      "File System (fs) & Path",
      "Streams (Readable & Writable)",
      "Buffers (allocation & serialization)",
      "EventEmitter (Observer Pattern)",
      "HTTP Server & Status Codes",
      "Environment Variables (process.env)",
      "Centralized Error Handling",
    ],
  };
  const jsonString = JSON.stringify(reportPayload, null, 2);
  // Buffer allocation: Demonstrating Node.js Buffer API
  const bufferData = Buffer.from(jsonString, "utf-8");
  console.log(`[SYLLABUS DEMO] Buffer allocated with size: ${bufferData.length} bytes`);
  // Set HTTP headers for file stream download
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", 'attachment; filename="edustream-manifest.json"');
  res.setHeader("X-Buffer-Byte-Length", bufferData.length.toString());
  // Node.js Stream piping: Streaming data without loading massive payloads into memory
  const readableStream = Readable.from(bufferData);
  readableStream.pipe(res);
});
module.exports = router;