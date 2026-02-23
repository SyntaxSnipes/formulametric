import './styles/index.css'
import { Route, Routes } from 'react-router-dom'
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import Home from './home'
import Drivers from './drivers'
import Rankings from './rankings'
import PropTypes from 'prop-types';
import NavBar from './components/navbar'

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

CustomLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired 
};

export default App
