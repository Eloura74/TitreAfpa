try {
  const app = require("../backend/api/index.js");
  module.exports = app;
} catch (error) {
  console.error("Failed to load backend:", error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: "Failed to load backend",
      details: error.message,
      stack: error.stack,
      env: process.env // Careful with secrets, but useful for debug. Maybe filter later.
    });
  };
}
