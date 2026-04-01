// import dotenv from "dotenv"
// import express from "express"
// import cors from 'cors'
// import { connectDB } from "./config/db.js"


// const app = express()
//  dotenv.config();
// app.use(cors())
// app.use(express.json())
// connectDB();

// const PORT = process.env.PORT || 5000

// app.get('/', (req, res)=>{
//   res.json({"message": "Server is running successfully 🚀"})
// })

// app.listen(PORT, () => {
//   console.log(`App running on port ${PORT}`)
// })









import app from "./app.js";
import dotenv from 'dotenv'
import { connectDB} from "./config/db.js"
const PORT = 5000;
dotenv.config();
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
}

startServer();



