import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale, // ✅ Needed for time-based x-axis
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // ✅ Required adapter

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale // ✅ Register time scale
);

interface SensorEntry {
  timestamp: string;
  value: number;
}

interface SensorData {
  [sensor: string]: SensorEntry[];
}

const Ku: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    const SUPABASE_URL = 'https://zbjaizgdknbkuuatfdjp.supabase.co';
    const SUPABASE_API_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiamFpemdka25ia3V1YXRmZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDI2NDQsImV4cCI6MjA2ODgxODY0NH0.bvncA5QvD0aTVPRMhEIBT9kZHT7vP9CR7zzQzNQ03CI';
    const TABLE_NAME = 'ku';

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?order=id.desc&limit=20`,
        {
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await res.json();
      console.log('📦 Raw Supabase data:', data);

      const tempSensorData: SensorData = {};

      data.reverse().forEach((row: any) => {
        const timestamp = new Date(
          `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}T${row.time}`
        ).toISOString();

        Object.entries(row).forEach(([key, value]) => {
          if (key.startsWith('marker')) {
            if (!tempSensorData[key]) {
              tempSensorData[key] = [];
            }

            const numericValue =
              typeof value === 'number'
                ? value
                : typeof value === 'string'
                ? parseFloat(value)
                : NaN;

            if (!isNaN(numericValue)) {
              tempSensorData[key].push({
                timestamp,
                value: numericValue,
              });
            }
          }
        });
      });

      console.log('✅ Parsed sensorData:', tempSensorData);
      setSensorData(tempSensorData);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-10 bg-white min-h-screen text-black">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-center font-bold uppercase tracking-wide">
          K-Under Readings
        </h1>
        <p className="text-gray-600  text-center mt-2">
          IIUM Strategic Technologies and Engineering Research Unit (ISTERU) Data Monitoring System
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-gray-300"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(sensorData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([sensor, entries]) => {
              const dataPoints = entries.map((e) => ({
                x: new Date(e.timestamp),
                y: e.value,
              }));

              const latestValue = entries[entries.length - 1]?.value ?? 0;

              return (
                <div
                  key={sensor}
                  className="bg-white  text-black rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border  p-6 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      {sensor.replace('_', ' ').toUpperCase()}
                    </h2>
                    <span className="text-sm bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full shadow-sm">
                      Latest: {latestValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative w-full h-[250px] md:h-[300px]">
                    <Line
                      key={sensor} // ✅ prevent canvas reuse error
                      data={{
                        datasets: [
                          {
                            label: sensor,
                            data: dataPoints,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            fill: true,
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            type: 'time',
                            time: {
                              unit: 'minute',
                              displayFormats: {
                                minute: 'HH:mm:ss',
                              },
                            },
                            ticks: {
                              color: '#6b7280',
                              maxRotation: 45,
                              minRotation: 30,
                            },
                            grid: {
                              display: false,
                            },
                          },
                          y: {
                            beginAtZero: false,
                            ticks: {
                              color: '#6b7280',
                            },
                            grid: {
                              color: '#e5e7eb',
                            },
                          },
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                          },
                        },
                        layout: {
                          padding: {
                            top: 10,
                            bottom: 20,
                            left: 10,
                            right: 10,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Ku;
