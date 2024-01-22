import expressAsyncHandler from "express-async-handler";
import { Attendance, Student } from "../schema/model.js";
import { successResponse } from "../helper/successResponse.js";
import { HttpStatus } from "../config/constant.js";
import { Parser } from "json2csv";
import { dateNow } from "../utils/Date.js";
import mongoose from "mongoose";

export let studentList = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let studentList = await Student.find({ batchId: _batchId });
  let response = {
    res,
    result: studentList,
    message: "All students of this Batch",
    statusCode: HttpStatus.OK,
  };
  successResponse(response);
});

export let submitAttendance = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let _data = req.body.data;
  let _date = new Date(dateNow());

  let check = await Attendance.find({
    batchId: _batchId,
    date: _date.toISOString(),
  });

  if (check[0] !== undefined) {
    let error = new Error("Attendance for today is already submitted");
    error.statusCode = 409;
    throw error;
  }
  _data.year = new Date().getYear() + 1900;
  _data.month = new Date().getMonth() + 1;
  _data.day=new Date().getDate()
  for (let i = 0; i < _data.length; i++) {
    // let status = _data[i].status === "P" ? 0 : _data[i].status === "A" ? 1 : 2;
    await Attendance.create({
      status:_data[i].status,
      studentId: _data[i].studentId,
      batchId: _batchId,
      year: _data.year,
      month: _data.month,
      day:_data.day
    });
  }
  let response = {
    res,
    message: "Attendance Successfully submitted",
    statusCode: HttpStatus.OK,
  };
  successResponse(response);
});

export let getAttendanceByDate = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let desiredYear = req.params.year;
  let desiredMonth = req.params.month;
  let result = await Attendance.find({
    batchId: _batchId,
    year: desiredYear,
    month: desiredMonth,
  }).populate({
    path: "studentId",
  });
  if(result.length===0){
    let response = {
      res,
      message: "Attendance Report",
      result,
      statusCode: HttpStatus.OK,
    };
  
    successResponse(response);
    return
  }
 console.log("inside")
  let studentList=await Student.find({batchId:_batchId})

  for (let i = 0; i < studentList.length; i++) {
    let existINResult=false

    for (let j = 0; j < result.length; j++) {
      if (JSON.stringify(result[j].studentId._id) === JSON.stringify(studentList[i]._id)) {
        existINResult=true
        break;
      }
    }

    if (!existINResult) {
      // Student does not exist in the result array
      let prepareData = {
        _id:studentList[i]._id,
        date:result[0].date,
        status:"---",
        studentId: studentList[i],
        batchId: result[0].batchId,
        year: result[0].year,
        month: result[0].month
      };
      console.log(prepareData);
      result.push(prepareData);
    }
  }

  let response = {
    res,
    message: "Attendance Report",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});


export let getAllAttendance = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let result = await Attendance.find({ batchId: _batchId });
  // let result = await Attendance.find({ batchId: _batchId })
  //   .populate({
  //     path: "studentId",
  //   })
  //   .populate({
  //     path: "batchId",
  //   });
  // console.log(result);
  // let response = {
  //   res,
  //   message: "Attendance Report",
  //   result,
  //   statusCode: HttpStatus.OK,
  // };

  // successResponse(response);
});

export let exportAllAttendance = expressAsyncHandler(async (req, res, next) => {
  const parser = new Parser();
  let myData = await Attendance.find({ batchId: req.params.batchId }).populate({
    path: "studentId",
    
  })
  .populate({
    path: "batchId"
  });
  let _myData = myData.map((curr) => {
    return {
      Course_Name: curr.batchId.course,
      Batch_Id: curr.batchId._id,
      Batch_Name: curr.batchId.name,
      Date: curr.date,
      Student_Id: curr.studentId._id,
      Student_name: curr.studentId.name,
      status:
        (curr.status === "P") ? "Present" : (curr.status === "A") ? "Absent" : "Leave",
    };
  });
  let _myDataSorted = _myData.sort(
    (a, b) => new Date(a.Date) - new Date(b.Date)
  );
  let csv = parser.parse(_myDataSorted);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment:filename=userData.csv");
  res.status(200).end(csv);
});

export let exportStudentAttendance = async (req, res, next) => {
  const parser = new Parser();
  let myData = await Attendance.find({
    batchId: req.params.batchId,
  }).populate({
    path: "studentId",
    match: {
      email: req.params.email,
    },
  });

  let result = myData.filter((attendance) => attendance.studentId !== null);
  let _myData = result.map((curr) => {
    return {
      Date: curr.date,
      name: curr.studentId.name,
      status:
        curr.status === 0 ? "present" : curr.status === 1 ? "absent" : "leave",
    };
  });
  let _myDataSorted = _myData.sort(
    (a, b) => new Date(a.Date) - new Date(b.Date)
  );
  let csv = parser.parse(_myDataSorted);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment:filename=userData.csv");
  res.status(200).end(csv);
};

export let exportAttendanceByDate = expressAsyncHandler(
  async (req, res, next) => {
    const parser = new Parser();
    let desiredYear = req.params.year;
    let desiredMonth = req.params.month;
    let myData = await Attendance.find({
      batchId: req.params.batchId,
      year: desiredYear,
      month: desiredMonth,
    }).populate({ path: "studentId" });
    let _myData = myData.map((curr) => {
      return {
        Course_Name: curr.batchId.course,
        Batch_Id: curr.batchId._id,
        Batch_Name: curr.batchId.name,
        Date: curr.date,
        Student_Id: curr.studentId._id,
        Student_name: curr.studentId.name,
        status:
          (curr.status === "P") ? "Present" : (curr.status === "A") ? "Absent" : "Leave",
      };
    });
    let _myDataSorted = _myData.sort(
      (a, b) => new Date(a.Date) - new Date(b.Date)
    );
    let csv = parser.parse(_myDataSorted);
    // console.log(csv, "csv.......");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment:filename=userData.csv");
    res.status(200).end(csv);
  }
);

export let getAttendance = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let email = req.params.email;
  
// Find the total class days for the specified batch
let totalClassDays = await Attendance.aggregate([
  {
    $match: {
      batchId:new mongoose.Types.ObjectId(_batchId),
    },
  },
  {
    $group: {
      _id: "$date", // Assuming "date" is the field containing the date of attendance
    },
  },
  {
    $group: {
      _id: null,
      totalClassDays: { $sum: 1 },
    },
  },
]);

// The result will be an array with a single object containing the totalClassDays
totalClassDays = totalClassDays.length > 0 ? totalClassDays[0].totalClassDays : 0;



  let result = await Attendance.find({
    batchId: _batchId,
  }).populate({
    path: "studentId",
    match: {
      email: email,
    },
  });

  console.log("result........", result);
  result = result.filter((attendance) => attendance.studentId !== null);
  console.log("0000000000000")
console.log(result)
   result={
    data:result,
    totalClassDays
  }
  let response = {
    res,
    message: "Attendance Report",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});







export let submitAttendanceAdmin = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let _data = req.body.data;
  let _date=req.body.date;
  let _year=_date.split("-")[0]
  let _month=_date.split("-")[1]
  let _day=_date.split("-")[2]
  console.log(_year)
  console.log(_day)
  for (let i = 0; i < _data.length; i++) {
    let conditions={
      year:parseInt(_year),
      month:parseInt(_month),
      day:parseInt(_day),
      batchId:_batchId,
      studentId:_data[i].studentId
    }
    console.log(conditions)
    let newData=await Attendance.findOneAndUpdate(conditions,{
      status:_data[i].status,
    }
    ,
    {new:true});
    console.log(newData)
    console.log("-------------------")
  }
  
  let response = {
    res,
    message: "Attendance Successfully Edited",
    statusCode: HttpStatus.OK,
  };
  successResponse(response);
});


export let getAttendanceByDateWithDay = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let desiredYear = req.params.year;
  let desiredMonth = req.params.month;
  let desiredDay=req.params.day;
  let result = await Attendance.find({
    batchId: _batchId,
    year: desiredYear,
    month: desiredMonth,
    day:desiredDay
  }).populate({
    path: "studentId",
  });
  if(result.length===0){
    let response = {
      res,
      message: "Attendance Report",
      result,
      statusCode: HttpStatus.OK,
    };
  
    successResponse(response);
    return
  }
  let studentList=await Student.find({batchId:_batchId})

  for (let i = 0; i < studentList.length; i++) {
    let existINResult=false

    for (let j = 0; j < result.length; j++) {
      if (JSON.stringify(result[j].studentId._id) === JSON.stringify(studentList[i]._id)) {
        existINResult=true
        break;
      }
    }

    if (!existINResult) {
      // Student does not exist in the result array
      let prepareData = {
        _id:studentList[i]._id,
        date:result[0].date,
        status:"---",
        studentId: studentList[i],
        batchId: result[0].batchId,
        year: result[0].year,
        month: result[0].month
      };
      console.log(prepareData);
      result.push(prepareData);
    }
  }

  let response = {
    res,
    message: "Attendance Report",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});