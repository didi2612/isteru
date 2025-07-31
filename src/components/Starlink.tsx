import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface DistroData {
  id: number;
  local: string;
  rain_intensity: number | null;
  rain_amt_acc: number | null;
  radar_reflect: number | null;
  num_of_particles: number | null;
  rain_amt: number | null;
  kinetic_energy: number | null;
  batt: number | null;
  inserted_at: string;
}

const Starlink = () => {
  const [distroData, setDistroData] = useState<DistroData[]>([]);

  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiamFpemdka25ia3V1YXRmZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDI2NDQsImV4cCI6MjA2ODgxODY0NH0.bvncA5QvD0aTVPRMhEIBT9kZHT7vP9CR7zzQzNQ03CI";
  const BASE_URL = "https://zbjaizgdknbkuuatfdjp.supabase.co/rest/v1";

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };

  useEffect(() => {
    const fetchDistro = async () => {
      try {
        const res = await fetch(`${BASE_URL}/distro?order=inserted_at.desc&limit=10`, { headers });

        const data = await res.json();

        if (Array.isArray(data)) {
          setDistroData(data);
        } else {
          console.error("Unexpected response:", data);
          setDistroData([]);
        }
      } catch (error) {
        console.error("Failed to fetch distro data:", error);
        setDistroData([]);
      }
    };

    fetchDistro();
    const interval = setInterval(fetchDistro, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-MY", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  const renderChart = (
    title: string,
    field: keyof DistroData,
    color: string,
    unit: string
  ) => {
    const latest20 = [...distroData].reverse();

    const labels = latest20.map((d) => formatTime(d.inserted_at));
    const dataValues = latest20.map((d) => d[field] ?? NaN);

    return (
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-center">{title}</h3>
        <div className="text-center text-xl font-bold mb-2">
          {dataValues.at(-1) ?? "N/A"} {unit}
        </div>
        <Line
          data={{
            labels,
            datasets: [
              {
                label: title,
                data: dataValues,
                borderColor: color,
                backgroundColor: color,
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            spanGaps: true,
           plugins: {
  legend: { display: false },
  tooltip: {
    callbacks: {
      title: (tooltipItems) => {
        const dateStr = tooltipItems[0].label; // Already formatted as time
        const fullDate = latest20[tooltipItems[0].dataIndex].inserted_at;
        return new Date(fullDate).toLocaleString("en-MY", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kuala_Lumpur",
        });
      },
    },
  },
}
,
            scales: {
             x: {
  type: "category",
  ticks: {
    autoSkip: false,
    maxRotation: 45,
    minRotation: 45,
  },
},

            },
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-4 mx-5 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">Disdrometer</h1>
        <p className="text-gray-600 mt-2">
          IIUM Strategic Technologies and Engineering Research Unit (ISTERU) Data Monitoring
          System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderChart("Rain Intensity", "rain_intensity", "#1f77b4", "mm/hr")}
        {renderChart("Rain Amount", "rain_amt", "#ff7f0e", "mm")}
        {renderChart("Rain Amount Accumulated", "rain_amt_acc", "#ffbb78", "mm")}
        {renderChart("Radar Reflectivity", "radar_reflect", "#2ca02c", "dBZ")}
        {renderChart("Particles", "num_of_particles", "#d62728", "count")}
        {renderChart("Kinetic Energy", "kinetic_energy", "#9467bd", "J/m²")}
        {renderChart("Battery Voltage", "batt", "#8c564b", "V")}
      </div>
    </div>
  );
};

export default Starlink;
