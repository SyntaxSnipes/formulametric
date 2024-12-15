import {  } from 'react'
import fmlogo from '/fmicon.png'
import './styles/index.css'
import { Route, Routes } from 'react-router-dom'
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import Home from './home'
import Drivers from './drivers'
import PropTypes from 'prop-types';

function NavBar() {

  return (
    <nav>
      <div className="flex justify-between items-center px-8 py-[0.3rem] h-[4.3rem] bg-[#15151e] text-[#ff1e00] fixed top-[0] left-[0] w-screen">
        <img className='w-[4.2rem] h-auto' src={fmlogo} alt="Formula Metric" />
        <span className='flex gap-4 list-none'>
          <CustomLink className='[all:unset] cursor-pointer text-[1.5rem]' to="/">Home</CustomLink>
          <CustomLink className='[all:unset] cursor-pointer text-[1.5rem]' to="/drivers">Drivers</CustomLink>
          <CustomLink className='[all:unset] cursor-pointer text-[1.5rem]' to="/teams">Teams</CustomLink>
        </span>
      </div>
    </nav>
  )
}

function App() {
  return (
    <div className='m-0 p-0 overflow-hidden !box-border'>
      <NavBar />
      <div className="flex justify-center items-center flex-col w-screen text-[#ff1e00] overflow-hidden h-[fit-content] mt-[4.3rem]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drivers" element={<Drivers />} />
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
