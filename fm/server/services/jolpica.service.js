import axios from "axios";
import { eBackoffRetry } from "../utils/retry.js"; //helper function to handle retries (Page XX)

const BASEURL = "https://api.jolpi.ca/ergast/f1" //base URL for everything from Jolpica

//helper function to make GET reqs to Jolpica, based on eBackoffRetry
async function jolpicaGet(url, maxRetries = 10) {
    try {
        //if the request succeeds, return the response
        return await axios.get(url)
    } catch (error) {
        //check if error is 429
        const is429 = error.response?.status === 429
        //use eBackoffRetry with until response is received or max retries is hit
        const res = await eBackoffRetry(() => axios.get(url), is429, 0, maxRetries);

        //if still no response, throw error
        if (!res) throw error

        //return response if successful
        return res;
    }
}

//function to fetch the Races for a given season
export async function fetchRaces(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/races.json`)
    return res.data?.MRData?.RaceTable?.Races ?? []; //return empty array if fails
}

//function to fetch the Drivers for a given season
export async function fetchDrivers(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers.json`)
    return res.data?.MRData?.DriverTable?.Drivers ?? []; //return empty array if fails
} 

//function to fetch the Constructors for a given season
export async function fetchDriverStandings(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/driverStandings.json`)
    return res.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []; //return empty array if fails
}

//function to fetch the Constructors for a given driver in a given season
export async function fetchConstructorsForDriver(year, apiDriverId) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers/${apiDriverId}/constructors.json`)
    return res.data?.MRData?.ConstructorTable?.Constructors ?? [] //return empty array if fails
}

//function to fetch the standings data for a given driver in a given season
export async function fetchStandingsForDriver(year, apiDriverId) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers/${apiDriverId}/driverStandings.json`)
    return res.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0] ?? null //return null if fails
}

//function to fetch the results data for a given season and round/race
export async function fetchResults(year, round) {
    const res = await jolpicaGet(`${BASEURL}/${year}/${round}/results.json`)
    return res.data?.MRData?.RaceTable?.Races?.[0] ?? null //return null if fails
}