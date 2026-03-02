import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// This file is the entry point of the application. It imports the Express app from app.js and starts the server on the specified port. The server listens for incoming requests and logs a message to the console when it is running.