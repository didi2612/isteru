import React, { useEffect, useState } from "react";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2p3Y2N4YmJkYWNncXlrcnF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE5NjIyMiwiZXhwIjoyMDYxNzcyMjIyfQ.azC7n_nGBFdaT98XBEUiJrsbdMyQTW9ynIKmB9dg_kk";
const BASE_URL = "https://escjwccxbbdacgqykrqw.supabase.co/rest/v1";

const ENDPOINTS = {
  solar_5s: "Solar",
  wind_5s: "Wind",
  temp_humid_5s: "Temperature & Humidity",
  loadcell_fixed: "Load Cell",
  smartbuoy: "Smart Buoy",
};

const PAGE_SIZE = 10;

const Verify: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<keyof typeof ENDPOINTS>("solar");
  const [data, setData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1); // reset to first page on endpoint change
  }, [selectedEndpoint]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      try {
        const response = await fetch(`${BASE_URL}/${selectedEndpoint}?select=*&order=timestamp.desc`, {

          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Range: `items=${from}-${to}`,
            Prefer: "count=exact",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const contentRange = response.headers.get("content-range");
        if (contentRange && contentRange.includes("/")) {
          const total = parseInt(contentRange.split("/")[1], 10);
          if (!isNaN(total)) setTotalRows(total);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setData([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedEndpoint, page]);

  const columnHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  const totalPages = Math.ceil(totalRows / PAGE_SIZE);

  return (
    <div className="p-6 max-w-full mx-5">
        <h1 className="mt-2 text-2xl uppercase font-bold text-black mb-2">Raw Data In Descending Order</h1>
      <p className="text-gray-600 text-md mb-6">Logging, Ocean-Based Utilities For Renewable Analytics</p>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
            
          <label htmlFor="source" className="font-semibold text-gray-700">Select Source:</label>
          <select
            id="source"
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value as keyof typeof ENDPOINTS)}
            className="border border-gray-300 rounded px-3 py-2 shadow-sm text-sm focus:outline-none focus:ring focus:border-blue-500"
          >
            {Object.entries(ENDPOINTS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <p className="text-gray-600 text-sm font-medium">Total records: {totalRows}</p>
      </div>

      {loading ? (
        <p className="text-gray-600 text-center mt-4">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-600 text-center mt-4">No data available for {ENDPOINTS[selectedEndpoint]}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 border text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                {columnHeaders.map((key) => (
                  <th key={key} className="px-4 py-2 border text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  {columnHeaders.map((key) => (
                    <td key={key} className="px-4 py-2 text-sm text-gray-700">{String(item[key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
