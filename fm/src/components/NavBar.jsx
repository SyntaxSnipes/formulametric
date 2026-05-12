import CustomLink from "./CustomLink";
import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import fmlogo from "/fmicon.svg";

//creating NavBar component to display the navigation bar with links to different pages of the application
export default function NavBar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <nav>
      <div className="flex justify-between items-center px-4 sm:px-6 py-[0.3rem] h-[4.3rem] z-10 bg-[#151822] text-[#ff1e00] fixed top-0 left-0 w-screen list-none">

        {/*logo linking back to home page*/}
        <CustomLink className="cursor-pointer" to="/">
          <img
            className="w-[5.2rem] h-auto"
            src={fmlogo}
            alt="Formula Metric"
          />
        </CustomLink>

        {/*desktop navigation links hidden on mobile*/}
        <span className="hidden sm:flex items-center gap-4">
          {/*link that goes to driver comparisons page*/}
          <CustomLink className="cursor-pointer text-[1rem]" to="/drivers">
            Driver Comparisons
          </CustomLink>
          {/*link that goes to driver rankings page*/}
          <CustomLink className="cursor-pointer text-[1rem]" to="/rankings">
            Driver Rankings
          </CustomLink>
          {/*external link to personal website*/}
          <a
            className="cursor-pointer text-[1rem] hover:opacity-80"
            href="https://aayanpathan.com"
            target="_blank"
            rel="noreferrer"
          >
            My Personal Website
          </a>
        </span>

        {/*hamburger menu button visible on mobile only*/}
        <button
          onClick={handleMenuOpen}
          className="sm:hidden flex flex-col justify-center gap-[5px] p-2"
        >
          <span className="block w-6 bg-[#ff1e00]" style={{ height: "2px" }}></span>
          <span className="block w-6 bg-[#ff1e00]" style={{ height: "2px" }}></span>
          <span className="block w-6 bg-[#ff1e00]" style={{ height: "2px" }}></span>
        </button>

        {/*mobile dropdown menu*/}
        <Menu
          id="nav-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: "#151822",
                color: "#ff1e00",
                "& .MuiMenuItem-root": {
                  fontSize: "1rem",
                  fontFamily: "inherit",
                },
                mt: 1,
                border: "1px solid rgba(255,255,255,0.04)",
              },
            },
          }}
        >
          {/*link that goes to driver comparisons page*/}
          <MenuItem component={CustomLink} to="/drivers" onClick={handleMenuClose}>
            Driver Comparisons
          </MenuItem>
          {/*link that goes to driver rankings page*/}
          <MenuItem component={CustomLink} to="/rankings" onClick={handleMenuClose}>
            Driver Rankings
          </MenuItem>
          {/*external link to personal website*/}
          <MenuItem
            component="a"
            href="https://aayanpathan.com"
            target="_blank"
            rel="noreferrer"
            onClick={handleMenuClose}
          >
            My Personal Website
          </MenuItem>
        </Menu>

      </div>
    </nav>
  );
}