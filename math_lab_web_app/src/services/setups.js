import axios from "axios";

const instance = axios.create({
  // baseURL: "http://localhost:5001/gt-math-lab/us-central1",
  baseURL: "https://us-central1-gt-math-lab.cloudfunctions.net",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
