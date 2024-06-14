import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useMain } from "../../hooks/useMain";

/**
 * ModuleLayout component to display tasks and provide functionality to download results and delete tasks.
 * 
 */
const ModuleLayout = ({ taskType }) => {
  const { tasks, updatePage, handleTaskDelete } = useMain();

  // Update the page with the current task type when the component mounts
  useEffect(() => {
    updatePage(taskType);
  }, [taskType]);

  /**
   * Function to download a CSV file.
   * 
   * @param {string} data - The CSV data to be downloaded.
   * @param {string} filename - The name of the CSV file.
   */
  function downloadCsvFile(data, filename) {
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <Grid container spacing={3} className="pt-4">
      {tasks.map((elem) => (
        <Grid item xs={12} md={6} key={elem.taskId}>
          <Card>
            <CardHeader title={elem.taskName} />
            <CardContent className="grid grid-flow-col">
              <Typography
                className="self-center sm:m-0 mb-2 sm:text-base text-xs"
                variant="body1"
              >
                Task Status - {parseInt(elem.taskProgress)}%
              </Typography>
              <Button
                variant="outlined"
                className="sm:text-base text-xs"
                disabled={elem.taskProgress < 100}
                onClick={() => {
                  window.ipc.send("download-results", {
                    taskId: elem.taskId,
                    filename: elem.taskName,
                  });
                  window.ipc.on("csv-results", ({ csv, filename }) => {
                    downloadCsvFile(csv, `${filename}.csv`);
                  });
                }}
              >
                Download Results
              </Button>
              <Button
                variant="outlined"
                className="sm:text-base text-xs ml-2 w-20 justify-self-end"
                color="error"
                onClick={() => handleTaskDelete(elem.taskId)}
              >
                <XMarkIcon className="h-7 w-7" />
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ModuleLayout;
