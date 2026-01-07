// Entry point for Vercel Serverless Functions
const { app, connectDB } = require("../server");

module.exports = async (req, res) => {
  try {
    // Ensure database is connected before handling the request
    await connectDB();

    // Forward request to Express app
    app(req, res);
  } catch (error) {
    console.error("Failed to connect to database in Vercel function:", error);
    res.status(500).json({
      error: "Database connection failed",
      details: error.message,
    });
  }
};
