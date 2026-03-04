import './styles/index.css' //importing base styles

import PropTypes from "prop-types";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

//creating Home component to display the landing page of the app with an introduction and features list
function Home() {
    return (
        <div className="flex flex-col justify-center items-center w-full h-screen bg-[#141418] text-[#ff1e00]">
            <header className="text-center mx-[0] my-4">
                <h1 className='text-[6em] leading-[1.1] '>FormulaMetric</h1>
                <p className='text-[1.2rem] max-w-[800px] mx-[auto] my-[0]'>Your one-stop app for accessing data about race drivers and teams across various years using statistics.</p>
            </header>
            <section className="text-center mx-[0] my-4">
                <h2 className='text-[2.5rem] mb-4'>Features</h2>
                <ul className='[list-style:none] p-0'>
                    <li className='text-[1.2rem] mx-[0] my-2'><strong className='text-[#ff1e00]'>Intuitive UI:</strong> Navigate through the app with ease using our user-friendly interface.</li>
                    <li className='text-[1.2rem] mx-[0] my-2'><strong className='text-[#ff1e00]'>Comprehensive Data:</strong> Access detailed statistics about your favorite drivers and teams.</li>
                    <li className='text-[1.2rem] mx-[0] my-2'><strong className='text-[#ff1e00]'>Yearly Comparisons:</strong> Analyze performance across different years to settle debates on the best teams and drivers.</li>
                    <li className='text-[1.2rem] mx-[0] my-2'><strong className='text-[#ff1e00]'>Interactive Charts:</strong> Visualize data with interactive charts and graphs.</li>
                </ul>
            </section>
            <section className="text-center mx-[0] my-4">
                <h2 className='text-[2.5rem] mb-4'>Purpose</h2>
                <p className='text-[1.2rem] max-w-[800px] mx-[auto] my-[0]'>Formula Metric aims to provide an easy way for enthusiasts to analyze their favorite team or driver across the years. Whether you&apos;re a fan looking to settle the age-old debate on which team or driver is the best, or a statistician seeking detailed performance data, Formula Metric has you covered.</p>
            </section>
            <div className="flex gap-4 list-none" style={{ marginTop: '30px' }}>
                <CustomLink to="/drivers" className="cursor-pointer hover:bg-[#e01b00] bg-[#ff1e00] text-[#fff] border-[none] px-[1.5em] py-[0.8em] text-[1.1rem] [transition:background-color_0.3s] rounded-[8px] ">Explore Drivers Comparison</CustomLink>
                <CustomLink to="/rankings" className="cursor-pointer hover:bg-[#e01b00] bg-[#ff1e00] text-[#fff] border-[none] px-[1.5em] py-[0.8em] text-[1.1rem] [transition:background-color_0.3s] rounded-[8px]">Explore Rankings</CustomLink>
            </div>
        </div>
    );
};

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