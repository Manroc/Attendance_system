import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
// import { MONGO_URL } from "../config/constant.js";
export let connectDb = expressAsyncHandler(async () => {
    // await mongoose.connect(MONGO_URL)
    // await mongoose.connect("mongodb://localhost:27017/attendance_sy")
    await mongoose.connect("mongodb://127.0.0.1:27017/attendance_sy")
    console.log(`expressApp is connected to mongodb atlas`)
})
