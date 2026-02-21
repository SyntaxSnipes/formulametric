import axios from "axios";
import { eBackoffRetry } from "../utils/retry.js";

const BASEURL = "https://api.jolpi.ca/ergast/f1"

async function jolpicaGet(url, maxRetries = 10) {
    try {
        return await axios.get(url)
    } catch (error) {
        const is429 = error.response?.status === 429
        const res = await eBackoffRetry(() => axios.get(url), is429, 0, maxRetries);
        if (!res) throw error
        return res;
    }
}

export async function fetchRaces(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/races.json`)
    return res.data?.MRData?.RaceTable?.Races ?? [];
}

export async function fetchDrivers(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers.json`)
    return res.data?.MRData?.DriverTable?.Drivers ?? [];
}

export async function fetchDriverStandings(year) {
    const res = await jolpicaGet(`${BASEURL}/${year}/driverStandings.json`)
    return res.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
}

export async function fetchConstructorsForDriver(year, apiDriverId) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers/${apiDriverId}/constructors.json`)
    return res.data?.MRData?.ConstructorTable?.Constructors ?? []
}

export async function fetchStandingsForDriver(year, apiDriverId) {
    const res = await jolpicaGet(`${BASEURL}/${year}/drivers/${apiDriverId}/driverStandings.json`)
    return res.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0] ?? null
}

export async function fetchResults(year, round) {
    const res = await jolpicaGet(`${BASEURL}/${year}/${round}/results.json`)
    return res.data?.MRData?.RaceTable?.Races?.[0] ?? null
}