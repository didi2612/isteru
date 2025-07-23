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
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
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
    const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiamFpemdka25ia3V1YXRmZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDI2NDQsImV4cCI6MjA2ODgxODY0NH0.bvncA5QvD0aTVPRMhEIBT9kZHT7vP9CR7zzQzNQ03CI';
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
      data.reverse();

      const tempSensorData: SensorData = {};

      data.forEach((row: any) => {
        const timestamp = new Date(
          `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}T${row.time}`
        ).toISOString();

        Object.entries(row).forEach(([key, value]) => {
          if (key.startsWith('marker')) {
            if (!tempSensorData[key]) tempSensorData[key] = [];

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

      setSensorData(tempSensorData);
    } catch (error) {
      console.error('Fetch error:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const marker1 = sensorData['marker1'] || [];
  const marker2 = sensorData['marker2'] || [];

  const combinedData = {
    datasets: [] as any[],
  };

  if (marker1.length && marker2.length) {
    // Plot marker1 line (upper)
    combinedData.datasets.push({
      label: 'MARKER 1 (Upper)',
      data: marker1.map((e) => ({ x: new Date(e.timestamp), y: e.value })),
      borderColor: 'rgba(0, 102, 204, 1)',
      backgroundColor: 'rgba(0, 102, 204, 0.1)',
      fill: false,
      tension: 0.4,
    });

    // Plot marker2 line (lower)
    combinedData.datasets.push({
      label: 'MARKER 2 (Lower)',
      data: marker2.map((e) => ({ x: new Date(e.timestamp), y: e.value })),
      borderColor: 'rgba(204, 0, 0, 1)',
      backgroundColor: 'rgba(204, 0, 0, 0.1)',
      fill: false,
      tension: 0.4,
    });
  }

  return (
    <div className="p-4  mx-5 bg-gray-50 ">
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
          Ku-band (MEASAT-3d)
        </h1>
        <p className="text-gray-600 mt-2">
          IIUM Strategic Technologies and Engineering Research Unit (ISTERU) Data Monitoring System
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-gray-300"></div>
        </div>
      ) : (
        <div className="bg-white border shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">Ku-band</h2>
          <div className="relative w-full h-[400px]">
            <Line
              data={combinedData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: 'minute',
                      displayFormats: {
                        minute: 'HH:mm',
                      },
                    },
                    ticks: {
                      color: '#6b7280',
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
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#374151',
                      boxWidth: 12,
                    },
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                layout: {
                  padding: 10,
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Ku;
