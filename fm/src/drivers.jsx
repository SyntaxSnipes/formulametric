import {useEffect, useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function Drivers(){

    const [drivers, setDrivers] = useState([]);
    useEffect(() => {
        fetch("http://localhost:5000/drivers")
          .then((res) => res.json()) // Ensure response is parsed as JSON
          .then((data) => {
            console.log("Server Response:", data);
            setDrivers(data);
          })
          .catch((err) => console.error("Error fetching drivers:", err));
      }, []);
      
    return (
        <div className="drivers">
            <h1>Driver Analysis</h1>
                <section>
                    <Accord title={"Select Year(s)"} content={"asd fsdjfklsajd flkasdjlfkasdjflksdafjlsdkafjlksdaflsdajfasdjfklsdjflks"}/>
                    <Accord title={"Select Driver"} content={"asd fsdjfklsajd flkasdjlfkasdjflksdafjlsdkafjlksdaflsdajfasdjfklsdjflks"}/>
                {drivers.length > 0 ? (
                    drivers.map((driver, index) => (
                        <h2 key={index}>
                            {driver.firstName} {driver.lastName}
                        </h2>
                    ))
                ) : (
                    <p>Loading drivers...</p>
                )}
                </section>
        </div>
    );
}

function Accord(props){
    return(
        <>
        <Accordion className='bg-[#15151e] text-[#ff1e00]'>
        <AccordionSummary
            expandIcon={<ArrowDownwardIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            className='bg-[#15151e] text-[#ff1e00]'

        >
          <Typography >{props.title}</Typography>
        </AccordionSummary>
        <AccordionDetails className='bg-[#15151e] text-[#ff1e00]'>
          <Typography className='bg-[#15151e] text-[#ff1e00]'>
            {props.content}
          </Typography>
        </AccordionDetails>
      </Accordion>
        </>
    )
}

export default Drivers;