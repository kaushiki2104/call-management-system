// import app from "../src/app.js";
// import { connectDB } from "../src/config/db.js";

// let isConnected = false;

// export default async function handler(req, res) {

//   if (!isConnected) {
//     await connectDB();
//     isConnected = true;
//   }

//   return app(req, res);
// }
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let isConnected = false;

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      success: false,
      message: "Server crashed",
      error: error.message
    });
  }
}

