import { Schema } from "mongoose";
import { dateNow } from "../utils/Date.js";

export let attendanceSchema = Schema({
  date: {
    type: Date,
    immutable:true,
    default: dateNow()
  },
  status:{
    type:String,
    required:true,
    enum:["P","A","L"],
    default: "A"
  },
  studentId: {
    type: Schema.ObjectId,
    ref: "Student"
  },
  batchId: {
    type: Schema.ObjectId,
    ref: "Batch"
  },
  year:{
    type:Number
  },
  month:{
    type:Number
  },
  day:{
    type:Number
  }
});
