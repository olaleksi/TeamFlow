export const errorHandling = (err, req,res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}