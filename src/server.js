import app from "./app.js";

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`,
  );
});
// This file is the entry point of the application. It imports the Express app from app.js and starts the server on the specified port. The server listens for incoming requests and logs a message to the console when it is running.