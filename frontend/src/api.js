import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const getRaces = (year) =>
  axios.get(`${BASE_URL}/races?year=${year}`);

export const getDrivers = (year, gp) =>
  axios.get(`${BASE_URL}/drivers?year=${year}&gp=${gp}`);

export const getComparison = (year, gp, drivers) =>
  axios.get(
    `${BASE_URL}/comparison?year=${year}&gp=${gp}&drivers=${drivers.join(",")}`
  );
