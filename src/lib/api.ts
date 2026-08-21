import axios from "axios";
import config from "@/src/config/config";
import { getAccessToken } from "./auth";

export const api = axios.create({
  baseURL: config.API,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((request) => {
  const token = getAccessToken();

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});