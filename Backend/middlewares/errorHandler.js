const errorHandler = (err, req, res, next) => {
  console.error("🛑 ERROR:", err.stack || err.message);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno del servidor",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

module.exports = errorHandler;