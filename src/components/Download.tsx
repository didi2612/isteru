import React, { useState } from "react";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiamFpemdka25ia3V1YXRmZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDI2NDQsImV4cCI6MjA2ODgxODY0NH0.bvncA5QvD0aTVPRMhEIBT9kZHT7vP9CR7zzQzNQ03CI";
const BASE_URL = "https://zbjaizgdknbkuuatfdjp.supabase.co/rest/v1/";
const ENDPOINTS = {
  ku: "Ku",
  ka: "Ka",
  distro: "distro",
};

const exportToCsv = (filename: string, rows: any[]) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent =
    headers.join(",") +
    "\n" +
    rows
      .map((row) =>
        headers
          .map((field) => {
            let val = row[field];
            if (val === null || val === undefined) val = "";
            else if (typeof val === "string" && val.includes(",")) {
              val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log(`[CSV] Exported: ${filename}`);
};

const Download: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<keyof typeof ENDPOINTS>("ku");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDataByDate = async () => {
  if (!startDateTime || !endDateTime) {
    alert("Please select both start and end datetime.");
    return;
  }

  if (new Date(startDateTime) > new Date(endDateTime)) {
    alert("Start must be before end.");
    return;
  }

  const startUTC = new Date(startDateTime).toISOString();
  const endUTC = new Date(endDateTime).toISOString();

  console.log(`[Manual Filter] UTC Range: ${startUTC} → ${endUTC}`);

  setLoading(true);
  let allData: any[] = [];
  let page = 0;
  const pageSize = 1000;

  try {
    while (true) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const url = `${BASE_URL}${selectedEndpoint}?select=*&order=id.desc`;
      console.log(`[Page ${page + 1}] Fetching: ${url} | Range: ${from}-${to}`);

      const response = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Range: `${from}-${to}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const chunk = await response.json();
      allData = allData.concat(chunk);
      console.log(`[Page ${page + 1}] Received: ${chunk.length} records`);

      if (chunk.length < pageSize) break;

      page++;
    }

    console.log(`[Total] Fetched: ${allData.length} records`);

    let filtered: any[] = [];

    if (selectedEndpoint === "distro") {
      // Filter using 'inserted_at' field
      filtered = allData.filter((row: any) => {
        if (!row.inserted_at) return false;
        const timeValue = new Date(row.inserted_at).getTime();
        return timeValue >= new Date(startUTC).getTime() && timeValue <= new Date(endUTC).getTime();
      });
    } else {
      // Default behavior for Ku and Ka
      filtered = allData.filter((row: any) => {
        const { year, month, day, time } = row;
        if (!year || !month || !day || !time) return false;

        const constructedISO = new Date(
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${time}`
        ).toISOString();

        const timeValue = new Date(constructedISO).getTime();
        const inRange = timeValue >= new Date(startUTC).getTime() && timeValue <= new Date(endUTC).getTime();

        if (inRange) {
          row.timestamp = constructedISO;
        }

        return inRange;
      });
    }

    console.log(`[Filtered] Matched records: ${filtered.length}`);
    setData(filtered);
  } catch (err) {
    console.error("[Manual Filter] Error:", err);
    alert("Error fetching data. Please try again.");
    setData([]);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 mx-5 mt-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl uppercase font-bold text-black mb-2">Download</h1>
      <p className="text-gray-600 text-md mb-7">IIUM Strategic Technologies and Engineering Research Unit (ISTERU) Data Monitoring System</p>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Select Data Source</label>
        <select
          className="w-full max-w-xs border border-gray-300 rounded-md py-2 px-3"
          value={selectedEndpoint}
          onChange={(e) => setSelectedEndpoint(e.target.value as keyof typeof ENDPOINTS)}
          disabled={loading}
        >
          {Object.entries(ENDPOINTS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:space-x-6 gap-6">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-gray-700 font-semibold mb-2">Start Date & Time (UTC+8)</label>
          <input
            type="datetime-local"
            step="1"
            className="w-full border border-gray-300 rounded-md py-2 px-3"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="block text-gray-700 font-semibold mb-2">End Date & Time (UTC+8)</label>
          <input
            type="datetime-local"
            step="1"
            className="w-full border border-gray-300 rounded-md py-2 px-3"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <button
        onClick={fetchDataByDate}
        disabled={loading || !startDateTime || !endDateTime}
        className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-md transition ${
          loading || !startDateTime || !endDateTime
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Fetching Data..." : "Fetch Data"}
      </button>

      {data.length > 0 && (
        <>
          <div className="mt-8 max-h-96 overflow-auto rounded-md border border-gray-300 shadow-sm">
            <table className="min-w-full table-auto border-collapse text-gray-800">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="border-b px-4 py-2 text-left text-sm font-semibold uppercase">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {Object.keys(row).map((key) => (
                      <td key={key} className="border-b px-4 py-2 text-sm break-words">
                        {String(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() =>
              exportToCsv(
                `${selectedEndpoint}-${startDateTime.replace(/[:T]/g, "-")}-${endDateTime.replace(/[:T]/g, "-")}.csv`,
                data
              )
            }
            className="mt-6 w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
          >
            Export as CSV
          </button>
        </>
      )}

      {data.length === 0 && !loading && (
        <p className="mt-8 text-center text-gray-600 italic">No data to display.</p>
      )}
    </div>
  );
};

export default Download;
