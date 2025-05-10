import Axios from "axios";
import type { AxiosInstance } from "axios";

const ADMIN_API_BASE_URL = process.env
  .NEXT_PUBLIC_SALARY_4_LIFE_API_BASE_URL as string;

export const salaryAxios = Axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});
export const tokenlessAxios = Axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const setAxiosDefaultToken = (
  token: string,
  axiosInstance: AxiosInstance
) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  
  }
};

export const deleteAxiosDefaultToken = () => {
  delete salaryAxios.defaults.headers.common.Authorization;
};
