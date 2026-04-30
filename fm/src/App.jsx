import './styles/index.css' //importing base styles
//importing necessary modules and components for the app, including React Router for routing between pages
import { Route, Routes } from 'react-router-dom'
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import CustomLink from './components/customLink'

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

//exporting the App component as the default export of the module
export default App
