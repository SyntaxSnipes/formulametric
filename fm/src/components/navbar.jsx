import PropTypes from "prop-types";
import fmlogo from "/fmicon.svg";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

//creating NavBar component to display the navigation bar with links to different pages of the application
export default function NavBar() {
  return (
    <nav>
      <div className="flex justify-between items-center px-8 py-[0.3rem] h-[4.3rem] z-10 bg-[#151822] text-[#ff1e00] fixed top-[0] left-[0] w-screen">
        <CustomLink className="cursor-pointer" to="/">
          <img
            className="w-[5.2rem] h-auto"
            src={fmlogo}
            alt="Formula Metric"
          />
        </CustomLink>
        <span className="flex gap-4">
          {/*Link that goes to driver comparisons page*/}
          <CustomLink
            className="cursor-pointer text-[1rem]"
            to="/drivers"
          >
            Driver Comparisons
          </CustomLink>
          {/*Link that goes to driver rankings page*/}
          <CustomLink
            className="cursor-pointer text-[1rem]"
            to="/rankings"
          >
            Driver Rankings
          </CustomLink>
        </span>
      </div>
    </nav>
  );
}

//creating CustomLink component to handle active link styling in the navigation bar
function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={`list-none ${isActive ? "active" : ""}`}>
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
