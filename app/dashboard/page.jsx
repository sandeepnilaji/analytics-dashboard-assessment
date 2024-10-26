"use client";

import { useState, useEffect } from "react";
import { processChartData, getUniqueValues } from "../utils/dataProcessing";
import ChartCard from "./components/ChartCard";
import { colorPalette } from "../utils/colors";

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/csv?page=${1}&pageSize=1000`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body.getReader();
        const stream = new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                return pump();
              });
            }
          }
        });
        const result = await new Response(stream).arrayBuffer();
        const decompressed = await new Response(result).json();
        setData(prevData => [...prevData, ...decompressed.data]);
        setIsLoading(false);
      } catch (e) {
        setError(e.message);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        Error: {error}
      </div>
    );
  }

  const uniqueMakes = getUniqueValues(data, "Make");
  const uniqueYears = getUniqueValues(data, "Model Year");
  const filteredData = data.filter((item) => {
    const matchesMake = selectedMake ? item["Make"] === selectedMake : true;
    const matchesYear = selectedYear
      ? item["Model Year"] === selectedYear
      : true;
    const matchesSearch =
      item["Make"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item["Model"]?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMake && matchesYear && matchesSearch;
  });

  const {
    makeCount,
    evTypeCount,
    cityCount,
    yearDistribution,
    avgElectricRangeByMake,
    cafvEligibility,
  } = processChartData(filteredData);

  const exportToCSV = () => {
    const headers = Object.keys(filteredData[0]);
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        headers
          .map((fieldName) => JSON.stringify(row[fieldName] ?? ""))
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "ev_data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const makeCountData = {
    labels: Object.keys(makeCount),
    datasets: [
      { data: Object.values(makeCount), backgroundColor: colorPalette },
    ],
  };

  const evTypeData = {
    labels: Object.keys(evTypeCount),
    datasets: [
      { data: Object.values(evTypeCount), backgroundColor: colorPalette },
    ],
  };

  const topCitiesData = {
    labels: Object.keys(cityCount).slice(0, 10),
    datasets: [
      {
        label: "Number of EVs",
        data: Object.values(cityCount).slice(0, 10),
        backgroundColor: colorPalette,
      },
    ],
  };

  const yearDistributionData = {
    labels: Object.keys(yearDistribution),
    datasets: [
      {
        label: "Number of Vehicles",
        data: Object.values(yearDistribution),
        borderColor: colorPalette,
        fill: false,
      },
    ],
  };

  const avgRangeData = {
    labels: avgElectricRangeByMake.map((item) => item.make),
    datasets: [
      {
        label: "Average Electric Range",
        data: avgElectricRangeByMake.map((item) => item.avgRange),
        backgroundColor: colorPalette,
      },
    ],
  };

  const cafvEligibilityData = {
    labels: Object.keys(cafvEligibility),
    datasets: [
      { data: Object.values(cafvEligibility), backgroundColor: colorPalette },
    ],
  };

  return (
    <div>
      <div className="w-full p-4 md:p-0 md:pb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="w-full lg:w-80">
            <input
              type="text"
              placeholder="Search by Make or Model"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg text-black p-2 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="w-full sm:w-auto border rounded-lg text-black p-2 outline-none transition-all"
            >
              <option value="">All Makes</option>
              {uniqueMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-auto border rounded-lg text-black p-2 outline-none transition-all"
            >
              <option value="">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button
              onClick={exportToCSV}
              className="w-full sm:w-auto bg-neutral-950 text-white rounded-lg p-2 hover:bg-neutral-800 transition-colors duration-200 flex items-center justify-center"
            >
              Export to CSV
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 md:p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard
            title="EV Makes Distribution"
            chartType="doughnut"
            data={makeCountData}
          />
          <ChartCard
            title="EV Types Distribution"
            chartType="pie"
            data={evTypeData}
          />
          <ChartCard
            title="Top 10 Cities with EVs"
            chartType="bar"
            data={topCitiesData}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard
            title="EV Model Year Distribution"
            chartType="line"
            data={yearDistributionData}
          />
          <ChartCard
            title="Top 10 Makes by Avg Electric Range"
            chartType="bar"
            data={avgRangeData}
            options={{
              indexAxis: "y",
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
        <ChartCard
          title="CAFV Eligibility Distribution"
          chartType="pie"
          data={cafvEligibilityData}
        />
      </div>
    </div>
  );
}
