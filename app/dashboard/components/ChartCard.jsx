"use client";

import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Card from "./Card";
import { useRef, useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartComponents = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
};

export default function ChartCard({
  title,
  chartType = "bar",
  data,
  options = {},
}) {
  const ChartComponent = chartComponents[chartType];
  const legendContainerRef = useRef(null);
  const [legendHeight, setLegendHeight] = useState("auto");

  useEffect(() => {
    if (legendContainerRef.current) {
      const container = legendContainerRef.current;
      if (container.scrollHeight > 80) {
        setLegendHeight("80px");
      } else {
        setLegendHeight("auto");
      }
    }
  }, [data]);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const datasetLabel =
              data.datasets[tooltipItem.datasetIndex].label || "";
            return `${tooltipItem.label}: ${tooltipItem.formattedValue}${
              datasetLabel ? ` (${datasetLabel})` : ""
            }`;
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          bottom: 10,
        },
      },
    },
    ...options,
  };

  const CustomLegend = () => {
    if (!data?.datasets) return null;

    const isMultiDataset =
      data.datasets.length > 1 && ["bar", "line"].includes(chartType);
    const dataset = data.datasets[0];
    const colors = dataset.backgroundColor || dataset.borderColor;

    if (isMultiDataset) {
      return (
        <div
          ref={legendContainerRef}
          className="flex flex-wrap gap-2 overflow-y-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          style={{
            height: legendHeight,
            maxHeight: "80px",
          }}
        >
          {data.datasets.map((dataset, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    dataset.backgroundColor || dataset.borderColor,
                }}
              />
              <span className="text-gray-700">{dataset.label}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={legendContainerRef}
        className="flex flex-wrap gap-2 overflow-y-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{
          height: legendHeight,
          maxHeight: "80px",
        }}
      >
        {data.labels?.map((label, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: Array.isArray(colors) ? colors[index] : colors,
              }}
            />
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <CustomLegend />
      <div className="h-80">
        <ChartComponent data={data} options={defaultOptions} />
      </div>
    </Card>
  );
}
