import { Router } from "express";
import {
  exportAllAttendance,
  exportAttendanceByDate,
  exportStudentAttendance,
  getAllAttendance,
  getAttendance,
  getAttendanceByDate,
  getAttendanceByDateWithDay,
  studentList,
  submitAttendance,
  submitAttendanceAdmin,
} from "../controllers/attendanceController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { isAuthorized, isAuthorizedAdmin } from "../middleware/isAuthorized.js";

let attendanceRouter = Router();

attendanceRouter
  .route("/export/:batchId/:email")
  .get(isAuthenticated, isAuthorized, exportStudentAttendance);

attendanceRouter
  .route("/:batchId/:year/:month")
  .get(isAuthenticated, isAuthorized, getAttendanceByDate);
  attendanceRouter
  .route("/:batchId/:year/:month/:day")
  .get(isAuthenticated, isAuthorized, getAttendanceByDateWithDay);
attendanceRouter
  .route("/studentList/:batchId")
  .get(isAuthenticated, isAuthorized, studentList);
attendanceRouter
  .route("/submit/:batchId")
  .post(isAuthenticated, isAuthorized, submitAttendance);
  attendanceRouter
  .route("/edit/:batchId")
  .put(isAuthenticated, isAuthorizedAdmin, submitAttendanceAdmin);
attendanceRouter
  .route("/:batchId")
  .get(isAuthenticated, isAuthorized, getAllAttendance);

attendanceRouter
  .route("/export/:batchId")
  .get(isAuthenticated, isAuthorized, exportAllAttendance);

attendanceRouter
  .route("/export/:batchId/:year/:month")
  .get(isAuthenticated, isAuthorized, exportAttendanceByDate);

attendanceRouter
  .route("/:batchId/:email")
  .get(isAuthenticated, isAuthorized, getAttendance);

export default attendanceRouter;
