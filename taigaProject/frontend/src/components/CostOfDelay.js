import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import "../App.css";
import LineChartMaker from "./reusable_components/LineChartMaker";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Buffer } from "buffer";

export default function CostOfDelay() {
  const [businessValueCostOfDelayData, setBusinessValueCostOfDelayData] =
    useState(null);
  const [storyPointCostDelayData, setStoryPointCostOfDelayData] =
    useState(null);

  const [projectSlug, setProjectSlug] = useState(null);
  const [sprintData, setSprintData] = useState([]);

  const [selectedOption, setSelectedOption] = useState("");

  const [projectId, setProjectId] = useState(null);
  const [sprintId, setSprintId] = useState(null);

  const [showLoader, setShowLoader] = useState(false);

  const clearData = () => {
    setSprintData([]);
    setSprintId(null);
    setBusinessValueCostOfDelayData(null);
    setStoryPointCostOfDelayData(null);
    setSelectedOption("");
    setShowLoader(false);
  };

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
    console.log(e.target.value);
    setSprintId(e.target.value);
    setShowLoader(true);
  };

  function onChangeProjectSlug(event) {
    setProjectSlug(event.target.value);
    clearData();
  }

  function apiCall(url, updateCall, scenario, authToken) {
    // axios
    //   .get(url, {
    //     headers: {
    //       Authorization: authToken,
    //     },
    //   })
    //   .then((res) => {
        // console.log("res", res.data);
        // const labels = Object.keys(res.data);
        // const values = Object.values(res.data);

        const data = {
            sprintDates: ["", "1st Feb 2024", "2nd Feb 2024", "3rd Feb 2024", "4th Feb 2024",
                         "5th Feb 2024", "6th Feb 2024", "7th Feb 2024", "8th Feb 2024",
                         "9th Feb 2024", "10th Feb 2024"],
            idealPath: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
            actualPath: [0, 1, 3, 5, 7, 11, 15, 17, 18, 21, 25],
            difference : [0, 2, 3, 4, 5, 4, 3, 4, 6, 6, 5]
        }

        const labels = data.sprintDates;
        const idealValues = data.idealPath
        const actualValues = data.actualPath;

        setShowLoader(false);

        labels[0] = "";
        const updated = {
          labels: labels,
          text: "Cost of delay data for " + scenario,
          datasets: [
            {
              label: "Ideal Path",
              data: idealValues,
              borderColor: "black",
              backgroundColor: ["rgb(255, 99, 132)", "rgb(255, 205, 86)"],
              hoverOffset: 4,
            },
            {
              label: "Actual Path",
              data: actualValues,
              borderColor: "orange",
              backgroundColor: ["rgb(255, 99, 132)", "rgb(255, 205, 86)"],
              hoverOffset: 4,
            },
          ],
        };
        updateCall(updated);
    //   });
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
        let s_Data = result.data[p_id];
        console.log(s_Data);
        setProjectId(p_id);
        setSprintData(s_Data);
        setShowLoader(true);
      });
  }

  useEffect(() => {
    const callApis = () => {
      const authToken = localStorage.getItem("authToken");
      console.log("authToken", authToken);
      console.log("sprintId", sprintId);
      console.log("projectId", projectId);

      if (authToken && projectId && sprintId) {
        apiCall(
          `/api/userstory/business_value_cost_of_delay?project_id=${projectId}&sprint_id=${sprintId}`,
          setBusinessValueCostOfDelayData,
          "business value",
          authToken
        );
      }
      if (authToken && sprintId & projectId) {
        apiCall(
          `/api/userstory/partial_userstory_cost_of_delay?project_id=${projectId}&sprint_id=${sprintId}`,
          setStoryPointCostOfDelayData,
          "storypoints",
          authToken
        );
      }
    };

    callApis();
    const intervalId = setInterval(callApis, 30000);
    return () => clearInterval(intervalId);
  }, [sprintId, projectId]);

  return (
    <div className="container-full bg-white">
      <div className="route-container flex flex-col min-h-[100%]">
        <Tabs
          style={{
            fontFamily: "Poppins",
            fontWeight: "500",
            fontSize: "0.9rem",
            border: "none",
            minHeight: "75%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TabList
            style={{ display: "flex", justifyContent: "left", border: "none" }}
          >
            <Tab
              className={"tabElements"}
              selectedClassName="selectedTabElements"
            >
              <p className="px-[0.8rem] text-center border-r-2 border-r-red-400 ">
                Business Value Cost of Delay
              </p>
            </Tab>
            <Tab
              className={"tabElements"}
              selectedClassName="selectedTabElements"
            >
              <p className="px-[0.8rem] text-center border-r-2 border-r-red-400 ">
                Storypoint Cost of Delay
              </p>
            </Tab>
          </TabList>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "50%",
              // minHeight: "50%"
            }}
            className="parent"
          >
            <div>
            <span className="text-[1rem] font-bold font-sans">
              Project Slug:
            </span>
            </div>
            <div 
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: "0.3rem",
                marginBottom: "0.6rem"
              }}
            >
            <input
              className="bg-white border-2 rounded-xl hover:rounded-none duration-300 border-[#ffd053] h-[2.3rem] px-3 w-[67%] text-[1rem] font-sans"
              type="username"
              value={projectSlug}
              onChange={onChangeProjectSlug}
              aria-label="username"
            />
            <button
              className="ml-[0.6rem] h-[2.45rem] w-[33%] border-4 border-[#ffd053] hover:bg-[#ffd053] duration-300 hover:text-white font-sans font-bold rounded-2xl hover:rounded-none"
              onClick={() => setProjectDetails()}
            >
              Submit
            </button>
            </div>
            {sprintData.length > 0 ? (
              <select
                value={selectedOption}
                onChange={handleDropdownChange}
                style={{ paddingBlock: "0.4rem", paddingInline: "0.5rem", marginBottom: "2.5rem", borderRadius: "0.5rem", borderColor: "#f98080" }}
              >
                <option className="dropdown" value="">Select an option</option>
                {sprintData.map((item) => (
                  <option key={item.id} value={item.id} className="dropdown">
                    {item.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
          <TabPanel>
            <LineChartMaker
              data={businessValueCostOfDelayData}
              showLoader={showLoader}
            />
          </TabPanel>
          <TabPanel>
            <LineChartMaker
              data={storyPointCostDelayData}
              showLoader={showLoader}
            />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

//end of code
