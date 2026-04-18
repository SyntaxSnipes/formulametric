import './styles/index.css' //importing base styles
//importing necessary modules and components for the app, including React Router for routing between pages
import { Route, Routes } from 'react-router-dom'
import { Link, useMatch, useResolvedPath } from "react-router-dom"

//importing all the pages and compoenents used in the app, as well as PropTypes for type checking
import Home from './home'
import Drivers from './drivers'
import Rankings from './rankings'
import NavBar from './components/NavBar'
import PropTypes from 'prop-types';

//creating main App component that sets up the structure of the app and defines the routes for different pages
function App() {
  return (
    <div className='m-0 p-0 !box-border'>
      <NavBar />
      <div className="flex justify-center items-center flex-col w-screen text-[#ff1e00] h-[fit-content] mt-[4.3rem]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path='/rankings' element={<Rankings />} />
        </Routes>
      </div>
    </div>
  )
}

//creating CustomLink component to create navigation links in the NavBar, using React Router to determine if the link is active and apply appropriate styling
function CustomLink({ to, children, ...props }) {
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

//exporting the App component as the default export of the module
export default App
