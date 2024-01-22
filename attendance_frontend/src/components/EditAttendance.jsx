import React, { useState } from "react";
import { useAuth } from "../context/auth";
import { useParams } from "react-router-dom";
import 'boxicons';
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
import Toastify from "./Toastify";

const EditAttendance = () => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [inputYear, setInputYear] = useState(new Date().toISOString().split("-")[0]);
  const [valueYear, setValueYear] = useState(new Date().toISOString().split("-")[0]);
  const [inputMonth, setInputMonth] = useState(new Date().toISOString().split("-")[1]);
  const [valueMonth, setValueMonth] = useState(new Date().toISOString().split("-")[1]);
  const [inputDay, setInputDay] = useState(new Date().toISOString().split("-")[2].split("T")[0]);
  const [valueDay, setValueDay] = useState(new Date().toISOString().split("-")[2].split("T")[0]);
  const [toastMessage, setToastMessage] = useState();
  const [severity, setSeverity] = useState();
  const [openToast, setOpenToast] = useState(false);
  const handleOpenToast = () => {
    setOpenToast(true);
  };

  const handleCloseToast = () => {
    setOpenToast(false);
  };
  const { batchId } = useParams();
  const user = useAuth();

  async function fetchStudentsReportAccDay() {
    try {
      const headersList = {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token()}`,
      };

      const response = await fetch(
        `http://localhost:8000/attendance/${batchId}/${inputYear}/${inputMonth}/${inputDay}`,
        {
          method: "GET",
          headers: headersList,
        }
      );

      const result = await response.json();

      const transformedData = result.result.map((v) => ({
        name: v.studentId.name,
        status: v.status,
        studentId: v.studentId._id,
      }));

      setData(transformedData);
    } catch (error) {
      console.error("Error fetching students report:", error);
      setOpenToast(true);
      setToastMessage("Something went wrong while fetching data");
      setSeverity("error");
    }
  }

  async function handleSubmit() {
    try {
      const headersList = {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token()}`,
      };

      const formattedDate = `${valueYear}-${valueMonth}-${valueDay}`;

      const requestBody = {
        data: data,
        date: formattedDate,
      };

      const response = await fetch(`http://localhost:8000/attendance/edit/${batchId}`, {
        method: "PUT",
        headers: headersList,
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setOpenToast(true);
        setToastMessage(responseData.message);
        setSeverity("success");
      } else {
        setOpenToast(true);
        setToastMessage(responseData.message);
        setSeverity("error");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setOpenToast(true);
      setToastMessage("Something went wrong while submitting attendance");
      setSeverity("error");
    }
  }

  const years = function () {
    const start = 2010;
    const end = parseInt(new Date().toISOString().split("-")[0]);
    return Array.from({ length: end - start + 1 }, (_, index) => (start + index).toString());
  };

  const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const yearsArray = years();
  const days = Array.from({ length: 31 }, (_, index) => (index + 1).toString());

  return (
    <div>
      <Stack direction={"row"} spacing={9} sx={{ marginBottom: "15px" }}>
        <Autocomplete
          inputValue={inputYear}
          onInputChange={(event, newInputYear) => setInputYear(newInputYear)}
          id="controllable-states-demo"
          options={yearsArray}
          value={valueYear}
          onChange={(e, nv) => setValueYear(nv)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Year" />}
        />
        <Autocomplete
          inputValue={inputMonth}
          onInputChange={(event, newInputValue) => setInputMonth(newInputValue)}
          id="controllable-states-demo"
          options={months}
          value={valueMonth}
          onChange={(event, newValue) => setValueMonth(newValue)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Month" />}
        />
        <Autocomplete
          inputValue={inputDay}
          onInputChange={(event, newInputDay) => setInputDay(newInputDay)}
          id="controllable-states-demo"
          options={days}
          value={valueDay}
          onChange={(e, nv) => setValueDay(nv)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Day" />}
        />

        <Button
          startIcon={<SendIcon />}
          variant="outlined"
          onClick={() => fetchStudentsReportAccDay()}
        >
          Fetch
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ padding: "10px" }} elevation={6}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {["name", new Date().toISOString().split("T")[0]].map((v, i) => (
                <TableCell key={i}>{v}</TableCell>
              ))}
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
                    const statuses = ["A", "P", "L"];
                    const currentIndex = statuses.indexOf(data[i].status);
                    const nextIndex = (currentIndex + 1) % statuses.length;
                    data[i].status = statuses[nextIndex];
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
      <Toastify
        handleOpen={handleOpenToast}
        handleClose={handleCloseToast}
        message={toastMessage}
        severity={severity}
        open={openToast}
      ></Toastify>
    </div>
  );
};

export default EditAttendance;
