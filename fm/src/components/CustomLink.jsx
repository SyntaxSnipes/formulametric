import PropTypes from 'prop-types';
import { Link, useMatch, useResolvedPath } from "react-router-dom"
//creating CustomLink component to create navigation links in the NavBar, using React Router to determine if the link is active and apply appropriate styling
export default function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  )
}

//defining PropTypes for the CustomLink component to ensure that the 'to' prop is a string and the 'children' prop is a valid React node
CustomLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired 
};

