import axios from "axios";
import { eBackoffRetry } from "../utils/retry.js"; //helper function to handle retries (Page XX)

const BASEURL = "https://api.jolpi.ca/ergast/f1" //base URL for everything from Jolpica

/**
 * Performs a Jolpica GET request with retry on 429.
 * @param {string} url Request URL.
 * @param {number} [maxRetries=10] Max retry attempts.
 * @returns {Promise<import("axios").AxiosResponse>} HTTP response.
 */
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

/**
 * Fetches all races for a season.
 * @param {number} year Season year.
 * @returns {Promise<Array<any>>} Race list.
 */
export async function fetchRaces(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/races.json`)
    return res.data?.MRData?.RaceTable?.Races ?? []; //return empty array if fails
}

/**
 * Fetches all drivers for a season.
 * @param {number} year Season year.
 * @returns {Promise<Array<any>>} Driver list.
 */
export async function fetchDrivers(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers.json`)
    return res.data?.MRData?.DriverTable?.Drivers ?? []; //return empty array if fails
} 

/**
 * Fetches season driver standings.
 * @param {number} year Season year.
 * @returns {Promise<Array<any>>} Standings list.
 */
export async function fetchDriverStandings(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/driverStandings.json`)
    return res.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []; //return empty array if fails
}

/**
 * Fetches constructors used by a driver in a season.
 * @param {number} year Season year.
 * @param {string} apiDriverId API driver identifier.
 * @returns {Promise<Array<any>>} Constructor list.
 */
export async function fetchConstructorsForDriver(year, apiDriverId) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers/${apiDriverId}/constructors.json`)
    return res.data?.MRData?.ConstructorTable?.Constructors ?? [] //return empty array if fails
}

/**
 * Fetches one driver's season standings row.
 * @param {number} year Season year.
 * @param {string} apiDriverId API driver identifier.
 * @returns {Promise<any|null>} Driver standings entry.
 */
export async function fetchStandingsForDriver(year, apiDriverId) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers/${apiDriverId}/driverStandings.json`)
    return res.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0] ?? null //return null if fails
}

/**
 * Fetches race results for a season round.
 * @param {number} year Season year.
 * @param {number|string} round Round number.
 * @returns {Promise<any|null>} Race payload.
 */
export async function fetchResults(year, round) {
    const res = await jolpicaGet(`${BASEURL}/${year}/${round}/results.json`)
    return res.data?.MRData?.RaceTable?.Races?.[0] ?? null //return null if fails
}