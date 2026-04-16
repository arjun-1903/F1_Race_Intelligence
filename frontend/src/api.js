import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const getRaces = (year) =>
  axios.get(`${BASE_URL}/races?year=${year}`);

export const getDrivers = (year, gp) =>
  axios.get(`${BASE_URL}/drivers?year=${year}&gp=${gp}`);

export const getAnalysis = (year, gp, drivers) => {
    return axios.get(`${BASE_URL}/analysis`, {
        params: { year, gp, drivers: drivers.join(",") }
    });
};
