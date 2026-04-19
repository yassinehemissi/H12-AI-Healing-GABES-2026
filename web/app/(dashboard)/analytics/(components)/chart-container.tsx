"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { SAMPLE_CHART_COLORS } from "../analytics.constants";
import type { ChartVisualization } from "../analytics.types";

interface ChartContainerProps {
  visualization: ChartVisualization;
}

/** Derive the value data keys from a data_points array (all keys except the x key). */
function getDataKeys(
  dataPoints: ChartVisualization["data_points"],
  xKey: string
): string[] {
  if (dataPoints.length === 0) return [];
  const allKeys = Object.keys(dataPoints[0]);
  const valueKeys = allKeys.filter((k) => k !== xKey);
  // Prefer "value" first if present
  if (valueKeys.includes("value")) return ["value", ...valueKeys.filter((k) => k !== "value")];
  return valueKeys;
}

/** Placeholder rendered when data_points is empty. */
function NoDataPlaceholder() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded-md border border-dashed border-muted-foreground/30 text-sm text-muted-foreground">
      No data available
    </div>
  );
}

export default function ChartContainer({ visualization }: ChartContainerProps) {
  const { chart_type, data_points, x_axis, y_axis, colors, title, description } =
    visualization;

  // x_axis is a human-readable label, not necessarily the actual data key.
  // Detect the real x key: prefer "label", "name", "month", "date", or fall back to first key.
  const xKey = (() => {
    if (!data_points[0]) return "label";
    const keys = Object.keys(data_points[0]);
    const preferred = ["label", "name", "month", "date", "category", "x"];
    return preferred.find((k) => keys.includes(k)) ?? keys[0];
  })();
  const resolvedColors = colors?.length ? colors : SAMPLE_CHART_COLORS;

  if (data_points.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {title && <p className="text-sm font-medium">{title}</p>}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        <NoDataPlaceholder />
      </div>
    );
  }

  const dataKeys = getDataKeys(data_points, xKey);

  const commonAxisProps = {
    stroke: "rgba(255,255,255,0.3)",
    tick: { fontSize: 12 },
  } as const;

  const tooltipContentStyle = {
    backgroundColor: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#e2e8f0",
  };

  let chart: React.ReactNode;

  switch (chart_type) {
    case "bar":
      chart = (
        <BarChart data={data_points}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey={xKey} {...commonAxisProps} />
          <YAxis label={y_axis ? { value: y_axis, angle: -90, position: "insideLeft", style: { fontSize: 11 } } : undefined} {...commonAxisProps} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={resolvedColors[i % resolvedColors.length]} />
          ))}
        </BarChart>
      );
      break;

    case "line":
      chart = (
        <LineChart data={data_points}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey={xKey} {...commonAxisProps} />
          <YAxis label={y_axis ? { value: y_axis, angle: -90, position: "insideLeft", style: { fontSize: 11 } } : undefined} {...commonAxisProps} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={resolvedColors[i % resolvedColors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      );
      break;

    case "area":
      chart = (
        <AreaChart data={data_points}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey={xKey} {...commonAxisProps} />
          <YAxis label={y_axis ? { value: y_axis, angle: -90, position: "insideLeft", style: { fontSize: 11 } } : undefined} {...commonAxisProps} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={resolvedColors[i % resolvedColors.length]}
              fill={resolvedColors[i % resolvedColors.length]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      );
      break;

    case "pie": {
      // For pie charts, use the first numeric key as the value key
      const valueKey = dataKeys[0] ?? "value";
      chart = (
        <PieChart>
          <Pie
            data={data_points}
            dataKey={valueKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
            }
          >
            {data_points.map((_, i) => (
              <Cell
                key={`cell-${i}`}
                fill={resolvedColors[i % resolvedColors.length]}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipContentStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      );
      break;
    }

    case "scatter": {
      // For scatter, use x_axis as X key and y_axis (or second key) as Y key
      const yKey = y_axis && y_axis !== xKey ? y_axis : (dataKeys[0] ?? "value");
      chart = (
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey={xKey} name={x_axis} {...commonAxisProps} />
          <YAxis dataKey={yKey} name={y_axis} {...commonAxisProps} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipContentStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Scatter
            name={title}
            data={data_points}
            fill={resolvedColors[0]}
          />
        </ScatterChart>
      );
      break;
    }

    default:
      chart = <NoDataPlaceholder />;
  }

  return (
    <div className="flex flex-col gap-2">
      {title && <p className="text-sm font-medium">{title}</p>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <ResponsiveContainer width="100%" height={280}>
        {chart as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
