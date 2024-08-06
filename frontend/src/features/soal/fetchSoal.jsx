import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
export const useFetchSoal = () => {
  const [soal, setSoal] = useState([]);
  try {
    setTimeout(async () => {
      const response = await axiosInstance.get(
        "http://localhost:5000/Minatkarir"
      );
      setSoal(response.data);
    }, 1500);
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  useEffect(() => {
    useFetchSoal();
  }, []);

  return {
    data: soal,
  };
};
