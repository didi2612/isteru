import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js";

interface WeatherData {
  timestamp: string;
  id: string;
  temp: number | null;
  pressure: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  value1: number | null;
  value2: number | null;
}

const parseNMEASentence = (sentence: string) => {
  return {
    temp: null,
    pressure: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    value1: null,
    value2: null,
    ...(() => {
      if (sentence.startsWith("$WIXDR")) {
        const parts = sentence.split(",");
        return {
          temp: parts.includes("TEMP") ? parseFloat(parts[parts.indexOf("TEMP") - 2]) : null,
          pressure: parts.includes("PRESS") ? parseFloat(parts[parts.indexOf("PRESS") - 2]) : null,
          humidity: parts.includes("RH") ? parseFloat(parts[parts.indexOf("RH") - 2]) : null,
        };
      }
      if (sentence.startsWith("$WIMWV")) {
        const parts = sentence.split(",");
        const windSpeed = parseFloat(parts[3]);
        const windDirection = parseFloat(parts[1]);
        return {
          windSpeed: isNaN(windSpeed) ? null : windSpeed,
          windDirection: isNaN(windDirection) ? null : windDirection,
        };
      }
      if (sentence.startsWith("$HYUDF")) {
        const parts = sentence.split(",");
        const value1 = parseFloat(parts[7]);
        const value2 = parseFloat(parts[8]);
        return {
          value1: isNaN(value1) ? null : value1,
          value2: isNaN(value2) ? null : value2,
        };
      }
      return {};
    })(),
  };
};

const Ses = () => {
  const [rawData, setRawData] = useState<WeatherData[]>([]);

  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2p3Y2N4YmJkYWNncXlrcnF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE5NjIyMiwiZXhwIjoyMDYxNzcyMjIyfQ.azC7n_nGBFdaT98XBEUiJrsbdMyQTW9ynIKmB9dg_kk"; // Replace with your actual key
  const BASE_URL = "https://escjwccxbbdacgqykrqw.supabase.co/rest/v1";

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };

  // Fetch all data with pagination (limit 1000)
  const fetchAllData = async (table: string): Promise<any[]> => {
    let allData: any[] = [];
    let from = 0;
    const limit = 1000;

    while (true) {
      const res = await fetch(
        `${BASE_URL}/${table}?order=timestamp.asc&limit=${limit}&offset=${from}`,
        { headers }
      );
      const batch = await res.json();
      allData = [...allData, ...batch];
      if (batch.length < limit) break;
      from += limit;
    }

    return allData;
  };

  useEffect(() => {
    const fetchData = async () => {
      const [tempHumid, wind, solar] = await Promise.all([
        fetchAllData("temp_humid"),
        fetchAllData("wind"),
        fetchAllData("solar"),
      ]);

      const formatData = (entry: any, type: string): WeatherData => {
        const parsed = parseNMEASentence(entry.data);
        return {
          timestamp: entry.timestamp,
          id: entry.id,
          temp: type === "temp_humid" ? parsed.temp : null,
          pressure: type === "temp_humid" ? parsed.pressure : null,
          humidity: type === "temp_humid" ? parsed.humidity : null,
          windSpeed: type === "wind" ? parsed.windSpeed : null,
          windDirection: type === "wind" ? parsed.windDirection : null,
          value1: type === "solar" ? parsed.value1 : null,
          value2: type === "solar" ? parsed.value2 : null,
        };
      };

      const combined: WeatherData[] = [
        ...tempHumid.map((e) => formatData(e, "temp_humid")),
        ...wind.map((e) => formatData(e, "wind")),
        ...solar.map((e) => formatData(e, "solar")),
      ];

      combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setRawData(combined);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const parsed = new Date(timestamp);
    return parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  const getCommonTimestamps = () => {
    const timestamps = Array.from(new Set(rawData.map((d) => d.timestamp)));
    return timestamps
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-10);
  };

  const getAlignedData = (field: keyof WeatherData) => {
    const commonTimestamps = getCommonTimestamps();
    return commonTimestamps.map((ts) => {
      const entries = rawData.filter((d) => d.timestamp === ts);
      for (const entry of entries) {
        if (entry[field] !== null && entry[field] !== undefined) {
          return entry[field];
        }
      }
      return null;
    });
  };

  const renderChart = (
    title: string,
    field: keyof WeatherData,
    unit: string,
    color: string
  ) => {
    const commonTimestamps = getCommonTimestamps();
    const alignedData = getAlignedData(field);
    const latestValid =
      [...alignedData].reverse().find((v) => v !== null && v !== undefined) ?? "N/A";

    return (
      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-center">{title}</h3>
        <div className="text-center text-xl font-bold mb-2">
          {latestValid} {unit}
        </div>
        <Line
          data={{
            labels: commonTimestamps.map(formatTimestamp),
            datasets: [
              {
                label: title,
                data: alignedData.map((v) => v ?? NaN),
                borderColor: color,
                fill: false,
              },
            ],
          }}
          options={{ responsive: true, spanGaps: true }}
        />
      </div>
    );
  };

  return (
    <div className="p-4  mx-5 bg-gray-50 ">
      <h1 className="mt-7 text-2xl  font-bold text-black text-center mb-2"> Ku-band (SES Satellite)</h1>
      <p className="text-gray-600 text-md text-center mb-3">
        IIUM Strategic Technologies and Engineering Research Unit (ISTERU) Data Monitoring System
      </p>
      
    </div>
  );
};

export default Ses;
