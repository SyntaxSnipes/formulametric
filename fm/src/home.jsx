import "./styles/index.css"; //importing base styles

import PropTypes from "prop-types";
import fmlogo from "/fmicon.svg";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

//creating Home component to display the landing page of the app with an introduction and features list
function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen bg-[#141418] text-[#ff1e00]">
      <header className="flex flex-col items-center justify-center mx-auto">
        <img className="w-[20rem] h-auto" src={fmlogo} alt="Formula Metric" />
        <p className="text-[6.2rem] max-w-[800px] mx-[auto] my-[0] text-white">
          FormulaMetric
        </p>
      </header>
      
      <section className="text-center mx-[0] my-4">
        <h2 className="text-[2.15rem] mb-4">What does it do?</h2>
        <p className="text-[1.2rem] max-w-[800px] mx-[auto] my-[0]">
          FormulaMetric aims to provide an easy way for enthusiasts to analyze
          their favorite team or driver across the years. Whether you&apos;re a
          fan looking to settle the age-old debate on which team or driver is
          the best, or a statistician seeking detailed performance data, Formula
          Metric has you covered.
        </p>
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

//creating CustomLink component to handle active link styling in the navigation bar
function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}

CustomLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
