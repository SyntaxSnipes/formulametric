import "./styles/index.css"; //importing base styles

import PropTypes from "prop-types";
import CustomLink from "./components/CustomLink";
import fmlogo from "/fmicon.svg";
import DriverPodium from "./components/DriverPodium";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

//creating Home component to display the landing page of the app with an introduction and features list
function Home() {
  return (
    <div className="flex flex-col justify-start items-center w-full bg-[#141418] text-[#ff1e00] py-12">
      <header className="flex flex-col items-center justify-center mx-auto">
        <p className="text-[6.2rem] max-w-[800px] mx-[auto] my-[0] text-white">
          FormulaMetric
        </p>
      </header>
      <DriverPodium /> {/*displaying the podium of drivers for the 2025 season*/}
      <section className="text-center mx-[0] my-4">
        <h2 className="text-[2.15rem] mb-4">What is FormulaMetric?</h2>
        <p className="text-[1.2rem] max-w-[800px] mx-[auto] my-[0]">
          FormulaMetric provides quick and objective analytics for Formula 1 drivers using a proprietary 4-factor scoring system. Track performance trajectories, compare absolute performance, consistency across races, and relative performance against teammates. Settle debates with data-driven insights.
        </p>
      </section>
      <section className="text-center mx-[0] my-8 w-full max-w-[1200px]">
        <h2 className="text-[2.15rem] mb-8">The P-metric Factors</h2>
        <div className="grid grid-cols-2 gap-6 px-4 md:grid-cols-5 mb-8">
          <div className="bg-[#1e1e1e] border border-[#4F4A4A] rounded-lg p-6 hover:bg-slate-900 transition-colors">
            <div className="flex items-center justify-center h-12 bg-[#16a34a] rounded-lg mb-4">
              <span className="text-white font-bold text-lg">Pt</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trajectory Score</h3>
            <p className="text-sm text-white/70">Measures how a driver&apos;s performance improves or declines throughout the season.</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#4F4A4A] rounded-lg p-6 hover:bg-slate-900 transition-colors">
            <div className="flex items-center justify-center h-12 bg-[#ca8a04] rounded-lg mb-4">
              <span className="text-white font-bold text-lg">Pa</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Absolute Score</h3>
            <p className="text-sm text-white/70">Evaluates the driver&apos;s raw performance compared to their peers.</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#4F4A4A] rounded-lg p-6 hover:bg-slate-900 transition-colors">
            <div className="flex items-center justify-center h-12 bg-[#1d4ed8] rounded-lg mb-4">
              <span className="text-white font-bold text-lg">Pc</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Consistency Score</h3>
            <p className="text-sm text-white/70">Assesses how reliably a driver performs across different races.</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#4F4A4A] rounded-lg p-6 hover:bg-slate-900 transition-colors">
            <div className="flex items-center justify-center h-12 bg-[#7c3aed] rounded-lg mb-4">
              <span className="text-white font-bold text-lg">Pr</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Relative Score</h3>
            <p className="text-sm text-white/70">Compares the driver&apos;s performance relative to their teammates.</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#4F4A4A] rounded-lg p-6 hover:bg-slate-900 transition-colors">
            <div className="flex items-center justify-center h-12 bg-[#dc2626] rounded-lg mb-4">
              <span className="text-white font-bold text-lg">Pagg</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Aggregate Score</h3>
            <p className="text-sm text-white/70">Combines all four factors into one comprehensive performance metric.</p>
          </div>
        </div>
      </section>
      <div className="flex gap-4 list-none" style={{ marginTop: "30px" }}>
        <CustomLink
          to="/drivers"
          className="cursor-pointer hover:bg-[#e01b00] bg-[#ff1e00] text-[#fff] border-[none] px-[1.5em] py-[0.8em] text-[1.1rem] [transition:background-color_0.3s] rounded-[8px] "
        >
          Explore Drivers Comparison
        </CustomLink>
        <CustomLink
          to="/rankings"
          className="cursor-pointer hover:bg-[#e01b00] bg-[#ff1e00] text-[#fff] border-[none] px-[1.5em] py-[0.8em] text-[1.1rem] [transition:background-color_0.3s] rounded-[8px]"
        >
          Explore Driver Rankings
        </CustomLink>
      </div>
    </div>
  );
}

export default Home;

