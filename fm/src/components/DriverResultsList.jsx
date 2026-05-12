import { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function DriverResultsList({ results, driverName }) {
  return (
    <div className="w-full">
      <Accordion
        defaultExpanded={false}
        sx={{
          backgroundColor: "#17171b",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "none",
          "&:before": { display: "none" },
          "& .MuiAccordionSummary-root": {
            backgroundColor: "#17171b",
            color: "#f2f2f2",
            padding: "12px 16px",
            minHeight: "auto",
          },
          "& .MuiAccordionSummary-content": {
            margin: 0,
          },
          "& .MuiAccordionDetails-root": {
            backgroundColor: "#15151e",
            padding: "8px",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#bdbdbd" }} />}
          sx={{
            "& .MuiTypography-root": {
              color: "#f2f2f2",
              fontWeight: "bold",
            },
          }}
        >
          {driverName} - Race Results
        </AccordionSummary>
        <AccordionDetails>
          <div className="flex flex-col gap-2 w-full">
            {results.map((race, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row rounded-lg p-3 sm:p-3 gap-2 sm:gap-4 text-white bg-[#1e1e1e] text-sm sm:text-base"
              >
                <h3 className="text-sm sm:text-base text-[#ff1e00] font-bold truncate">
                  {race.RoundNo}. {race.Track}
                </h3>
                <p className="text-xs sm:text-sm flex-shrink-0">
                  {new Date(race.Date).toLocaleDateString()}
                </p>
                <p className="text-xs sm:text-sm flex-shrink-0">Position: {race.Position}</p>
                <p className="text-xs sm:text-sm flex-shrink-0">Status: {race.Status}</p>
              </div>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
