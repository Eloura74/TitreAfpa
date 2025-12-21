try {
  const { app, connectDB } = require("../backend/server.js");

  module.exports = async (req, res) => {
    try {
      // On s'assure que la DB est connectée avant de traiter la requête
      await connectDB();
      return app(req, res);
    } catch (dbError) {
      console.error("Failed to connect to MongoDB in Vercel handler:", dbError);
      res.status(500).json({
        error: "Database connection failed",
        details: dbError.message
      });
    }
  };
} catch (error) {
  console.error("Failed to load backend:", error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: "Failed to load backend",
      details: error.message,
      stack: error.stack,
      env: process.env
    });
  };
}
