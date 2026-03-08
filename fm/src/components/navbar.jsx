import PropTypes from "prop-types";
import fmlogo from "/fmicon.png";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

//creating NavBar component to display the navigation bar with links to different pages of the application
export default function NavBar() {
  return (
    <nav>
      <div className="flex justify-between items-center px-8 py-[0.3rem] h-[4.3rem] z-10 bg-[#15151e] text-[#ff1e00] fixed top-[0] left-[0] w-screen">
        <img className="w-[4.2rem] h-auto" src={fmlogo} alt="Formula Metric" />
        <span className="flex gap-4 list-none">
          {/*Link that goes to Home page*/}
          <CustomLink
            className="[all:unset] cursor-pointer text-[1.5rem]"
            to="/"
          >
            Home
          </CustomLink>
          {/*Link that goes to driver comparisons page*/}
          <CustomLink
            className="[all:unset] cursor-pointer text-[1.5rem]"
            to="/drivers"
          >
            Driver Comparisons
          </CustomLink>
          {/*Link that goes to Rankings page*/}
          <CustomLink
            className="[all:unset] cursor-pointer text-[1.5rem]"
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
