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
      
      // Wrapper pour capturer les erreurs non gérées dans les routes
      const originalSend = res.send;
      const originalJson = res.json;
      let errorCaptured = false;
      
      res.send = function(data) {
        console.log(`[VERCEL] Response sent: ${res.statusCode}`);
        return originalSend.call(this, data);
      };
      
      res.json = function(data) {
        console.log(`[VERCEL] JSON Response: ${res.statusCode}`, JSON.stringify(data).substring(0, 200));
        return originalJson.call(this, data);
      };
      
      // Appel de l'app Express avec gestion d'erreur
      try {
        return app(req, res);
      } catch (routeError) {
        if (!errorCaptured && !res.headersSent) {
          errorCaptured = true;
          console.error("[VERCEL] ROUTE ERROR:", routeError.message);
          console.error("[VERCEL] Stack:", routeError.stack);
          return res.status(500).json({
            error: "Route processing failed",
            details: routeError.message,
            route: req.url,
          });
        }
      }
    } catch (dbError) {
      console.error("[VERCEL] DB Error:", dbError.message);
      console.error("[VERCEL] Stack:", dbError.stack);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Database connection failed",
          details: dbError.message,
          mongoUri: process.env.MONGO_URI ? "SET" : "MISSING",
        });
      }
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
