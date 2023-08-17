import { TextInput, Loader, MantineProvider } from '@mantine/core';
import { useEffect, useState, forwardRef } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { DateRange, Today } from '@mui/icons-material';
import { Button, Switch, TextField } from '@mui/material';
import MantineNumberInput from './externalComponents/MantineNumberInput';
import { SegmentedControl } from '@mantine/core';
import MultipleSelectCheckmarks from './externalComponents/MultipleSelectCheckmarks';
import { Slider } from '@mui/material';
import dayjs from 'dayjs';
import { HiArrowSmallRight, HiArrowsRightLeft } from 'react-icons/hi2';
import axios from 'axios';
import airports from '../airports.json';
import { Group, Text, MantineColor, SelectItemProps, Autocomplete } from '@mantine/core';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {DatePickerInput} from '@mantine/dates'


function SearchForm ({darkMode, setFlights, setFlightListLoading, setError, returnFlight, setReturnFlight, currency, setCurrency}) {
    
    const [loading, setLoading] = useState(false);   
    const [moreFilters, setMoreFilters] = useState(false); 

    // Form state values
    const [fromLocation, setFromLocation] = useState("LHR, London Heathrow Airport");
    const [toLocation, setToLocation] = useState("");
    const [departureDate, setDepartureDate] = useState(dayjs());
    const [departureDates, setDepartureDates] = useState([null,null]);
    const [returnDate, setReturnDate] = useState(null);
    const [returnDates, setReturnDates] = useState([null, null]);

    const [adultValue, setAdultValue] = useState(1);
    const [childrenValue, setChildrenValue] = useState(0);
    const [infantsValue, setInfantsValue] = useState(0);
    const [cabin, setCabin] = useState("M");
    const [stopovers, setStopovers] = useState('0');
    const [travelDays, setTravelDays] = useState();

    const [value2, setValue2] = useState([0, 5000]);
    const minDistance = 200;

    function valuetext(value) {
        return `${value}°C`;
    }

    const autofill_data = airports.map((item) => ({ ...item, value: item.iata + ", " + item.name }));

    const handlePriceChangeInputFields = (e, whichOne) => {
        
        let minPrice = value2[0];
        let maxPrice = value2[1];
        if (whichOne === 1) {
            setValue2([e.target.value, maxPrice])
        } else {
            setValue2([minPrice, e.target.value])
        }
    }

    const handleAdultChange = (adultInputVal) => {
        setAdultValue(adultInputVal);
    }

    const handleChildChange = (childInputValue) => {
        setChildrenValue(childInputValue)
    }

    const handleChange2 = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        if (newValue[1] - newValue[0] < minDistance) {
            if (activeThumb === 0) {
                const clamped = Math.min(newValue[0], 5000 - minDistance);
                setValue2([clamped, clamped + minDistance]);
            } else {
                const clamped = Math.max(newValue[1], minDistance);
                setValue2([clamped - minDistance, clamped]);
            }
        } else {
        setValue2(newValue);
        }
    };

    const handleReturnFlightToggle = (e) => {
        if (returnFlight) {
            setReturnDate(null);
        }
        setReturnFlight(e.target.checked);
        
    }

    const handleSubmit = async function(event) {
        event.preventDefault();
        setFlightListLoading(true);
        setError(false);
        try {
            if (!moreFilters) {
                const URL = `http://localhost:8081/booking/getFiltered/?flyTo=${toLocation.substring(0,3)}&flyFrom=${fromLocation.substring(0,3)}&leaveDateFrom=${departureDate[0].format('DD/MM/YYYY')}&leaveDateTo=${departureDate[1].format('DD/MM/YYYY')}&numberOfAdults=${adultValue}`
                console.log(URL);
                const response = await axios.get(URL)
                console.log(response);
                await setFlights(response.data);
            } else {
                let isWeekdaysOnly = false;
                let isWeekendsOnly = false;
                if (travelDays === "weekdays") {
                    isWeekdaysOnly = true;
                } else if (travelDays === "weekends") {
                    isWeekendsOnly = true;
                } else if (travelDays === "both") {
                    isWeekdaysOnly = false;
                    isWeekendsOnly = false;
                }
                console.log(departureDate.subtract(4, "days").toDate().toLocaleDateString());
                console.log(departureDate.add(4, "days").toDate().toLocaleDateString())
                const URL = `http://localhost:8081/booking/getFiltered/?flyTo=${toLocation.substring(0,3)}&flyFrom=${fromLocation.substring(0,3)}&leaveDateFrom=${departureDate.subtract(4, "days").toDate().toLocaleDateString()}&leaveDateTo=${departureDate.add(4, "days").toDate().toLocaleDateString()}&numberOfAdults=${adultValue}&numberOfChildren=${childrenValue}&stopovers=${stopovers}&priceFrom=${value2[0]}&priceTo=${value2[1]}&cabin=${cabin}&weekdaysOnly=${isWeekdaysOnly}&weekendsOnly=${isWeekendsOnly}&currency=${currency.split(' ')[1]}`
                const response = await axios.get(URL)
                console.log(response);
                await setFlights(response.data);
                if (response.data.length == 0) { setError(true) }
            }
                
        } catch (error) {
            console.error(error);
            setError(true)
        }
        setFlightListLoading(false);
    }

    return (  

        <>
            {/* <MantineProvider theme={{ colorScheme: `${darkMode === "dark" ? 'dark' : 'light'}` }}> */}
            <form onSubmit={handleSubmit} className={`text-gray-600 dark:text-gray-300 shadow-lg gap-5 p-8 grid justify-items-center items-start border-slate-300/30 dark:border-slate-100/10 rounded-3xl border-[1px] w-[1000px] max-w-[90%] ${moreFilters ? `min-h-[90%]` : `min-h-[40%]`} min-h-[230px] mx-auto transition-all duration-300 ease-out mt-28 sm:mt-0 overflow-scroll sm:overflow-hidden`}>
                <div className='flex justify-evenly sm:justify-around w-[100%] mb-4'>
                    <div className='flex w-[250px] h-min self-end text-xs text-center items-center justify-center sm:justify-normal'>
                        <p className={`flex gap-1 ${!returnFlight ? 'text-blue-500 dark:text-blue-300' : ''}`}>One-way<HiArrowSmallRight fontSize={'1.2rem'}/></p>
                        <Switch 
                            className=' bottom-0'
                            checked={returnFlight}
                            onChange={handleReturnFlightToggle}
                            
                        />
                        <p className={`flex gap-1 ${returnFlight ? 'text-blue-500 dark:text-blue-300' : ''}`}><HiArrowsRightLeft fontSize={'1.2rem'}/>Return</p>
                        
                    </div>
                    <p className="text-[0] sm:text-3xl self-end font-['Montserrat'] font-light">Search for Flights</p>
                    <div className=' w-[0px] sm:w-[250px]'></div>
                </div>
                
                
                <div className='sm:flex self-start w-[80%] h-min mx-auto gap-2'>
                    <div className='flex gap-2 w-[100%] sm:w-auto mb-4 sm:mb-0'>
                        {/* <TextField
                            className='mx-auto h-max w-[50%] sm:w-auto'
                            placeholder="From Location"
                            value={fromLocation}
                            onChange={(e) => setFromLocation(e.target.value)}
                            rightsection={loading ? <Loader size="xs" /> : <></>}
                        /> */}
                        <MantineProvider theme={{ colorScheme: `${darkMode === "dark" ? 'dark' : 'light'}`}}>
                            <Autocomplete
                                size='lg'
                                classNames={{ 
                                    item: 'text-sm whitespace-prewrap break-normal', 
                                    input:'transition-all duration-200',
                                    dropdown: 'overflow-y-scroll max-h-[450px]'
                                }}
                                className='mx-auto w-[50%] sm:w-auto'
                                value={fromLocation}
                                onChange={setFromLocation}
                                onClick={() => {setFromLocation("")}}
                                rightsection={loading ? <Loader size="xs" /> : <></>}
                                required
                                limit={20}
                                placeholder="Choose start airport"
                                data={autofill_data}
                                transitionProps={{ transition: 'pop-top-left', duration: 120, timingFunction: 'ease' }}
                                filter={(value, item) =>
                                item.value.toLowerCase().includes(value.toLowerCase().trim())
                                }
                            />
                        </MantineProvider>
                        <MantineProvider theme={{ colorScheme: `${darkMode === "dark" ? 'dark' : 'light'}` }}>
                            <Autocomplete
                                size='lg'
                                classNames={{ 
                                    item: 'text-sm whitespace-prewrap break-normal',
                                    input:'transition-all duration-200',
                                    dropdown: 'overflow-y-scroll max-h-[450px]'
                                }}
                                className='mx-auto w-[50%] sm:w-auto'
                                value={toLocation}
                                onChange={setToLocation}
                                onClick={() => setToLocation("")}
                                rightsection={loading ? <Loader size="xs" /> : <></>}
                                required
                                limit={20}
                                placeholder="Choose destination airport"
                                data={autofill_data}
                                transitionProps={{ transition: 'pop-top-left', duration: 120, timingFunction: 'ease' }}
                                filter={(value, item) =>
                                item.value.toLowerCase().includes(value.toLowerCase().trim())
                                }
                            />
                        </MantineProvider>
                    </div>
                    <div className='flex gap-2 mb-4 sm:mb-0'>
                        {/* <DatePicker
                            label="Departing"
                            defaultValue={dayjs()}
                            value={departureDate}
                            minDate={dayjs()}
                            
                            maxDate={returnDate ? returnDate.subtract(1, "days") : ''}
                            onChange={(newValue) => setDepartureDate(newValue)}
                        /> */}
                        <MantineProvider theme={{ colorScheme: `${darkMode === "dark" ? 'dark' : 'light'}` }}>
                            <DatePickerInput
                                type="range"
                                // label="Departure Date Range"
                                className='w-[200px] rounded-md'
                                size='md'
                                placeholder='Departure Date Range'
                                valueFormat='DD/MM/YYYY'
                                value={departureDates}
                                minDate={new Date()}
                                maxDate={returnDates[0] ? dayjs((returnDates[0])).subtract(1, "day") : ''}
                                onChange={(newValue) => setDepartureDates(newValue)}
                            />
                            {returnFlight ? 
                                <DatePickerInput
                                    type="range"
                                    // label="Departure Date Range"
                                    className='w-[200px] rounded-md'
                                    size='md'
                                    placeholder='Return Date Range'
                                    valueFormat='DD/MM/YYYY'
                                    value={returnDates}
                                    minDate={departureDates[1] ? (dayjs(departureDates[1])).add(1, "day") : ''}
                                    onChange={(newValue) => setReturnDates(newValue)}
                                /> : <></>}
                        </MantineProvider>
                        
                    </div>
                    <p onClick={() => setMoreFilters(!moreFilters)} className='box-border text-white h-[57px] font-semibold border-[1px] rounded-lg px-3 hover:bg-opacity-100 dark:hover:bg-opacity-100 border-blue-500 dark:border-blue-700 hover:text-white shadow-black hover:shadow-md bg-blue-500 dark:bg-blue-700 transition-all duration-200 active:brightness-[80%] active:shadow-none active:translate-y-[1px] cursor-pointer w-[20%] text-sm flex items-center'>{moreFilters ? <p><RemoveIcon/> Less Filters</p> : <p><AddIcon/> More Filters</p>}</p>

                    {/* <div className='flex gap-2 w-[100%] sm:w-auto mb-4 sm:mb-0'>
                        <TextField/>
                    </div> */}
                </div>
                {moreFilters ? 
                <>
                    <div className='content-center self-center w-[80%] h-min mx-auto gap-2 flex flex-col gap-2'>
                        <MantineProvider  theme={{ colorScheme: `${darkMode === "dark" ? 'dark' : 'light'}` }}>
                        <SegmentedControl 
                                transitionDuration={300}
                                transitionTimingFunction="linear"
                                radius="lg"
                                value={cabin}
                                color='indigo'
                                onChange={(e) => setCabin(e)}
                                data={[
                                    { label: 'Economy', value: 'M' },
                                    { label: 'Premium Economy', value: 'W' },
                                    { label: 'First Class', value: 'F' },
                                    { label: 'Business Class', value: 'C' },
                                ]}
                                className='h-min rounded-full transition-all duration-200'
                        />
                        <SegmentedControl 
                                transitionDuration={300}
                                transitionTimingFunction="linear"
                                radius="lg"
                                value={stopovers}
                                color='indigo'
                                onChange={(e) => setStopovers(e)}
                                data={[
                                    { label: 'No stopovers', value: '0' },
                                    { label: 'Single stopover', value: '1' }
                                ]}
                                className='h-min rounded-full transition-all duration-200'
                        />
                        <SegmentedControl 
                                    transitionDuration={300}
                                    transitionTimingFunction="linear"
                                    radius="lg"
                                    value={travelDays}
                                    color='indigo'
                                    onChange={(e) => setTravelDays(e)}
                                    data={[
                                        { label: 'Travel on weekdays only', value: 'weekdays' },
                                        { label: 'Travel on weekends only', value: 'weekends' },
                                        { label: 'Travel on any day', value: 'both' },
                                    ]}
                                    className='h-min rounded-full transition-all duration-200'

                            />
                        </MantineProvider>

                        
                    </div>

                    {/* border-solid border-white border-[5px] Add this to the classname so we can see the DIV tag properly! */}
                    <div className='sm:flex self-center w-[80%] h-min mx-auto gap-2'>
                        <div className='border-solid border-0 w-[33%]'>
                            <MantineProvider  theme={{ colorScheme: `${darkMode === "dark" ? 'dark' : 'light'}` }}>

                            <div className='sm:flex self-center h-min gap-2 my-1'>
                                <p className="text-lg self-center text-end font-['Roboto'] font-light tracking-wide w-[80px]">Adults</p>
                                <MantineNumberInput value={adultValue} setValue={handleAdultChange} adult={true} oppValue={childrenValue}/>
                            </div>
                            <div className='sm:flex self-center h-min gap-2 my-1'>
                                <p className="text-lg self-center text-end font-['Roboto'] font-light tracking-wide w-[80px]">Children</p>
                                <MantineNumberInput value={childrenValue} setValue={handleChildChange} adult={false} oppValue={adultValue}/>
                            </div>

                            {/* <div className='sm:flex self-center h-min gap-2 my-1'>
                                <p className=" text-lg self-center text-end font-['Roboto'] font-light tracking-wide w-[80px]">Infants</p>
                                <MantineNumberInput value={infantsValue} setValue={setInfantsValue} className={'transition-all duration-200'}/>
                            </div> */}
                            </MantineProvider>
                        </div>

                        <div className='w-[33%] border-solid border-0 gap-3'>
                            <div className='sm:flex self-center justify-center mx-auto h-min gap-2'>
                                {/* <p className="text-lg self-center font-['Roboto'] font-light tracking-wide w-[60px]">Stops</p> */}
                                
                            </div>

                            <MultipleSelectCheckmarks currency={currency} setCurrency={setCurrency}/>
                        </div>

                        <div className='w-[33%] border-solid border-0 flex flex-col gap-3'>
                              
                              <TextField inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} id="outlined-basic" label="Min Price" variant="outlined" value={value2[0]} onChange={(e) => {handlePriceChangeInputFields(e, 1)}}/>
                              <TextField inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} id="outlined-basic" label="Max Price" variant="outlined" value={value2[1]} onChange={(e) => {handlePriceChangeInputFields(e, 2)}}/>
                                <Slider
                                    getAriaLabel={() => 'Minimum distance shift'}
                                    value={value2}
                                    onChange={handleChange2}
                                    valueLabelDisplay="auto"
                                    max={5000}
                                    getAriaValueText={valuetext}

                                    
                                    style={{width: '90%'}}
                                />
                        </div>
                    </div>

                </>
                : <></>}
                <button type='submit' className='box-border text-white h-[40px] font-semibold border-[1px] rounded-lg px-3 hover:bg-opacity-100 dark:hover:bg-opacity-100 border-blue-500 dark:border-blue-700 hover:text-white shadow-black hover:shadow-md bg-blue-500 dark:bg-blue-700 transition-all duration-200 active:brightness-[80%] active:shadow-none active:translate-y-[1px]'>Submit</button>
            </form>
            {/* </MantineProvider> */}
        </>
    );
}

export default SearchForm;