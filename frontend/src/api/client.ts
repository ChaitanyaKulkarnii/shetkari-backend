import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiError {
  error: string;
  detail: string | any;
  status: number;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError: ApiError = {
      error: "Unknown Error",
      detail: "An unexpected error occurred",
      status: 500,
    };

    if (error.response) {
      customError.status = error.response.status;
      if (error.response.data) {
        // Handle FastAPI validation errors (422) specifically
        if (error.response.status === 422 && Array.isArray(error.response.data.detail)) {
          customError.error = "Validation Error";
          customError.detail = error.response.data.detail;
        } else {
          customError.error = error.response.data.error || "Server Error";
          customError.detail = error.response.data.detail || error.response.data.message || "Something went wrong on the server";
        }
      }
    } else if (error.request) {
      customError.error = "Network Error";
      customError.detail = "Server is not reachable, please try again.";
      customError.status = 0;
    }

    return Promise.reject(customError);
  }
);
