import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import axios from "axios";
// import { Box } from '@ant-design/plots';
import BoxPlotChartMaker from "./reusable_components/BoxPlotChartMaker";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import format from 'date-fns/format'
import { addDays } from 'date-fns'

export default function LeadTime() {
  const [projectSlug, setProjectSlug] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [range, setRange] = useState([
    {
      startDate: addDays(new Date(), -7),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [open, setOpen] = useState(false);
  const refOne = useRef(null);

  const maxDate = new Date();
  // console.log(maxDate);
  const [rangedLeadTimeData, setRangedLeadTimeData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  function onChangeProjectSlug(event) {
    setProjectSlug(event.target.value);
  }

  function apiCall(url, updateCall, authToken) {
    axios
      .get(url, {
        headers: {
          Authorization: authToken,
        },
      })
      .then((res) => {
        console.log("data", res.data);

        let data = res.data;

        // let sprintData = [
        //   { x: 'Sprint1', y : [1, 9, 16, 22, 24]},
        //   { x: 'Sprint2', y : [2, 8, 12, 21, 28]},
        //   { x: 'Sprint3', y : [1, 7, 10, 17, 22]}
        // ]

        const leadTimeValuesByKey = {};

        for (const key in data) {
          leadTimeValuesByKey[key] = data[key].map(
            (item) => item["lead_time"]
          );
        }

        let labels = Object.keys(leadTimeValuesByKey);
        let values = Object.values(leadTimeValuesByKey);

        let updated = {
          labels: labels,
          values: values,
        };

        updated["label"] = "Boxplot";

        updateCall(updated);
      });
  }

  function setProjectDetails() {
    const authToken = localStorage.getItem("authToken");
    let url = "/api/project/milestone_data?project_slug=" + projectSlug;
    axios
      .get(url, {
        headers: {
          Authorization: authToken,
        },
      })
      .then((result) => {
        console.log("result", result.data);
        console.log("p_id", Object.keys(result.data)[0]);
        let p_id = Object.keys(result.data)[0];
        // let p_id = 1521718
        setProjectId(p_id);
      });

      setStartDate(range[0].startDate);
      setEndDate(range[0].endDate);
  }

  useEffect(() => {
    document.addEventListener("keydown", hideOnEscape, true);
    document.addEventListener("click", hideOnClickOutside, true);
  }, []);

  useEffect(() => {
    if(open)
      setRangedLeadTimeData(null);
  }, [open])

  const hideOnEscape = (e) => {
    console.log(e.key);
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hideOnClickOutside = (e) => {
    console.log(refOne.current);
    console.log(e.target);
    if (refOne.current && !refOne.current.contains(e.target)) {
      setOpen(false);
    }
  };
  
  useEffect(() => {
    const callApis = () => {
      const authToken = localStorage.getItem("authToken"); 

      if(projectId && startDate && endDate && authToken) {
        let formattedStartDate = startDate.toISOString().slice(0, 10);
        console.log("startdate", startDate, "    formattedStartDate", formattedStartDate, "       range start date", range[0].startDate, "       range end date", range[0].endDate);
        let formattedEndDate = endDate.toISOString().slice(0, 10);
        apiCall(`/api/task/lead_time_time_range?project_id=${projectId}&start_date=${formattedStartDate}&end_date=${formattedEndDate}`, setRangedLeadTimeData, authToken);
      }
      
    }
    
    callApis();
    const intervalId = setInterval(callApis, 30000);
    return () => clearInterval(intervalId);
  }, [projectId, startDate, endDate]);
  
  return (
    <div className="container-full">
      <div
        className="flex flex-col min-h-[100%] justify-evenly space-y-[2.2rem] align-top w-[100%] pt-[1rem] pb-[1rem] px-[2rem]"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "50%",
          }}
          className="parent"
        >
          <div className="text-[2rem] w-auto rounded-none border-solid border-b-[4px] border-b-[#ffd053] font-bold bg-white hover:border-b-red-400 duration-300 font-sans text-start mt-0 pb-[0.2rem] mb-[1rem]">
            <span>Lead Time</span>
          </div>
          <div className="flex flex-row space-x-[1rem] w-full justify-between">
            <div className="flex flex-col space-y-[0.2rem] w-[33%]">
              <span className="text-[1rem] font-bold font-sans">
                Project Slug:
              </span>
              <input
                className="bg-white border-2 rounded-xl hover:rounded-none duration-300 border-[#ffd053] h-[2.3rem] px-3 w-full text-[1rem] font-sans"
                type="username"
                value={projectSlug}
                onChange={onChangeProjectSlug}
                aria-label="username"
              />
            </div>
            <div className="flex space-y-[0.2rem] flex-col w-[67%]">
              <span className="text-[1rem] font-bold font-sans">
                Date Range:
              </span>
              <div className="flex flex-row space-x-[0.5rem] justify-between relative">
                <input
                  value={`${format(
                    range[0].startDate,
                    "MM/dd/yyyy"
                  )} to ${format(range[0].endDate, "MM/dd/yyyy")}`}
                  readOnly
                  className="border-2 rounded-xl hover:rounded-none duration-300 border-[#ffd053] h-[2.3rem] px-3 w-[67%] text-[1rem] font-sans"
                  onClick={() => setOpen((open) => !open)}
                />

                <div ref={refOne}>
                  {open && (
                    <DateRangePicker
                      onChange={(item) => setRange([item.selection])}
                      editableDateInputs={true}
                      moveRangeOnFirstSelection={false}
                      ranges={range}
                      months={2}
                      direction="horizontal"
                      className="calendarElement font-sans"
                      maxDate={maxDate}
                    />
                  )}
                </div>
                <button
                  className="h-[2.3rem] w-[50%] border-4 border-[#ffd053] hover:bg-[#ffd053] duration-300 hover:text-white font-sans font-bold rounded-xl hover:rounded-none"
                  onClick={() => setProjectDetails()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>{" "}
        <div>
          {rangedLeadTimeData &&
            <BoxPlotChartMaker {...rangedLeadTimeData} />}
        </div>
      </div>
    </div>
  );
}