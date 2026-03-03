import PropTypes from "prop-types";
import fmlogo from "/fmicon.png";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

export default function NavBar() {
  return (
    <nav>
      <div className="flex justify-between items-center px-8 py-[0.3rem] h-[4.3rem] bg-[#15151e] text-[#ff1e00] fixed top-[0] left-[0] w-screen">
        <img className="w-[4.2rem] h-auto" src={fmlogo} alt="Formula Metric" />
        <span className="flex gap-4 list-none">
          <CustomLink
            className="[all:unset] cursor-pointer text-[1.5rem]"
            to="/"
          >
            Home
          </CustomLink>
          <CustomLink
            className="[all:unset] cursor-pointer text-[1.5rem]"
            to="/drivers"
          >
            Driver Comparisons
          </CustomLink>
          <CustomLink
            className="[all:unset] cursor-pointer text-[1.5rem]"
            to="/rankings"
          >
            Rankings
          </CustomLink>
        </span>
      </div>
    </nav>
  );
}

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
