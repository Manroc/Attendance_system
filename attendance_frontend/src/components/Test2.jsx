
import React, { useState } from "react";
import { useAuth } from "../context/auth";
import { useParams } from "react-router-dom";
import 'boxicons'
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";

const Test2 = () => {
  let [columns, setColumns] = useState([]);
  let [studentRep, setStudentRep] = useState([]);
  let [data, setData] = useState([]);
  console.log("==============first===========")
  console.log(data)
  console.log("===================")
  let [inputYear, setInputYear] = useState([
    new Date().toISOString().split("-")[0],
  ]);
  let [valueYear, setValueYear] = useState([
    new Date().toISOString().split("-")[0],
  ]);
  let [inputMonth, setInputMonth] = useState([
    new Date().toISOString().split("-")[1],
  ]);
  let [valueMonth, setValueMonth] = useState([
    new Date().toISOString().split("-")[1],
  ]);

  const [inputValue, setInputValue] = React.useState(
    new Date().toISOString().split("-")[1]
  );
  let [inputDay, setInputDay] = useState([
    new Date().toISOString().split("-")[2].split("T")[0],
  ]);
  let [valueDay, setValueDay] = useState([
    new Date().toISOString().split("-")[2].split("T")[0],
  ]);
  let [toastMessage, setToastMessage] = useState();
  let [severity, setSeverity] = useState();
  let [openToast, setOpenToast] = useState(false);


  let { batchId } = useParams();
  let user = useAuth();

  async function fetchStudentsReportAccDay() {
    let headersList = {
      "Content-type": "application/json",
      Authorization: `Bearer ${user.token()}`,
    };

    let response = await fetch(
      "http://localhost:8000/attendance/" +
        batchId +
        "/" +
        inputYear +
        "/" +
        inputMonth+
        "/"+
        inputDay,
      {
        method: "GET",
        headers: headersList,
      }
    );

    let data = await response.json();
    
    let res = data.result.map((v) => {
      let a = {
        name: v.studentId.name,
        status: v.status,
        studentId: v.studentId._id,
      };
      return a;
    });
    
    setData(res);
  
    // let dates = new Set();

    // let nm = new Set();

    // data.result.forEach((v, id) => {
    //   if (v.studentId) {
    //     nm.add(v.studentId._id + "-" + v.studentId.name);
    //     dates.add(v.date);
    //   }
    // });

    // let unique = [...dates];

    // let studentsd = {};
    // let columns = new Set();
    // let names = new Set();
    // let res = data.result.map((v) => {
   
    //   columns.add(v.date.split("T")[0]);

    //   if (v.studentId) {
    //     names.add(v.studentId.name);
    //     if (studentsd[v.studentId.name]) {
    //       studentsd[v.studentId.name].push(
    //         v.status 
    //       );
    //     } else {
    //       studentsd[v.studentId.name] = [
    //         v.status 
    //       ];
    //     }
    //   }

    // });


    // setColumns(unique);

    // setStudentRep([...nm]);

  }
  async function handleSubmit() {
    console.log("INSIDE")
    let headersList = {
      "Content-type": "application/json",
      Authorization: `Bearer ${user.token()}`,
    };
    let miti=valueYear+"-"+valueMonth+"-"+valueDay

   let prepareData={
    data:data,
    date:miti
   }
    let bodyContent = JSON.stringify( prepareData );
    let data
    try{
     let response=await fetch(
        "http://localhost:8000/attendance/edit/" + batchId,
        {
          method: "put",
          headers: headersList,
          body: bodyContent,
        }
      );
       data=await response.json()
    }
    catch(e){
      setOpenToast(true);
      setToastMessage("something went wrong");
      setSeverity("error");
    }
          
    if(data.success) {
      setOpenToast(true)
      setToastMessage(data.message);
      setSeverity("success")  
    } else {
    setOpenToast(true);
    setToastMessage(data.message);
    setSeverity("error");
  }
  }
  

  const yrs = function () {
    let dates = [];

    let start = 2010;
    let end = parseInt(new Date().toISOString().split("-")[0]);

    for (let i = start; i <= end; i++) {
      dates.push(i.toString());
    }

    return dates;
  };


  const mon = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const yr = yrs();
  const day = Array.from({ length: 31 }, (_, index) => (index + 1).toString());



  return (
    <div>
      <Stack direction={"row"} spacing={9} sx={{ marginBottom: "15px" }}>
        <Autocomplete
          inputValue={inputYear}
          onInputChange={(event, newInputYear) => {
            setInputYear(newInputYear);
          }}
          id="controllable-states-demo"
          options={yr}
          value={valueYear}
          onChange={(e, nv) => {
            setValueYear(nv);
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Year" />}
        />
        <Autocomplete
          inputValue={inputMonth}
          onInputChange={(event, newInputValue) => {
            setInputMonth(newInputValue);
          }}
          id="controllable-states-demo"
          options={mon}
          value={valueMonth}
          onChange={(event, newValue) => {
            setValueMonth(newValue);
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Month" />}
        />
        <Autocomplete
          inputValue={inputDay}
          onInputChange={(event, newInputDay) => {
            setInputDay(newInputDay);
          }}
          id="controllable-states-demo"
          options={day}
          value={valueDay}
          onChange={(e, nv) => {
            setValueDay(nv);
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Day" />}
        />

        <Button
          startIcon={<SendIcon />}
          variant="outlined"
          onClick={() => {
            fetchStudentsReportAccDay();
          }}
        >
          fetch{" "}
        </Button>
        <Button
        //   startIcon={<SendIcon />}
          variant="contained"
          color="success"
          onClick={ handleSubmit}
        >
          Submit{" "}
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ padding: "10px" }} elevation={6}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {["name", new Date().toISOString().split("T")[0]].map((v, i) => {
                return <TableCell key={i}>{v}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row, i) => (
              <TableRow
                key={i}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>

                <TableCell
                  onClick={() => {
                    if (data[i].status === "A") {
                      data[i].status = "P";
                    } else if (data[i].status === "P") {
                      data[i].status = "L";
                    } else if (data[i].status === "L") {
                      data[i].status = "A";
                    }
                    console.log(data[i].status);

                    setData([...data]);
                  }}
                >
                  <Button
                    sx={{
                      color:
                        data[i].status === "A"
                          ? "red"
                          : data[i].status === "P"
                          ? "primary"
                          : "orange",
                    }}
                  >
                    {row.status}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
       
      </TableContainer>
    </div>
  );
};

export default Test2;


