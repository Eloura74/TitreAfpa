try {
  console.log("[VERCEL] Loading backend/server.js...");
  const { app, connectDB } = require("../backend/server.js");
  console.log("[VERCEL] Backend loaded successfully");

  module.exports = async (req, res) => {
    try {
      console.log(`[VERCEL] Handling ${req.method} ${req.url}`);
      // On s'assure que la DB est connectée avant de traiter la requête
      await connectDB();
      console.log("[VERCEL] MongoDB connected");
      return app(req, res);
    } catch (dbError) {
      console.error("[VERCEL] DB Error:", dbError.message);
      console.error("[VERCEL] Stack:", dbError.stack);
      res.status(500).json({
        error: "Database connection failed",
        details: dbError.message,
        mongoUri: process.env.MONGO_URI ? "SET" : "MISSING",
      });
    }
  };
} catch (error) {
  console.error("[VERCEL] CRITICAL: Failed to load backend");
  console.error("[VERCEL] Error:", error.message);
  console.error("[VERCEL] Stack:", error.stack);
  module.exports = (req, res) => {
    res.status(500).json({
      error: "Failed to load backend",
      details: error.message,
      stack: error.stack,
    });
  };
}
