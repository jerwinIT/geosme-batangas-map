"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { getSMEInsights } from "@/app/actions/sme-insights";
import type { SMEInsightsData } from "@/app/actions/sme-insights";
import { getFintechInsights } from "@/app/actions/fintech-insights";
import type { FintechInsightsData } from "@/app/actions/fintech-insights";
import type { CategoryCount } from "@/types/insights";

type Tab = "sme" | "fintech";
type CircularChart = "years" | "type" | "forms" | "assetSize";
type BarChartMetric = "employees" | "income";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const CIRCULAR_CHART_TABS: { id: CircularChart; label: string }[] = [
  { id: "years", label: "Years" },
  { id: "type", label: "Type" },
  { id: "forms", label: "Forms" },
  { id: "assetSize", label: "Asset Size" },
];

const BAR_CHART_TABS: { id: BarChartMetric; label: string }[] = [
  { id: "employees", label: "Employees" },
  { id: "income", label: "Income" },
];

const TABS: { id: Tab; label: string }[] = [
  { id: "sme", label: "SME Insights" },
  { id: "fintech", label: "Fintech Insights" },
];

const TOOLTIP_STYLE = {
  fontSize: 12,
  background: "var(--sidebar)",
  border: "1px solid var(--sidebar-border)",
};

export default function DashboardPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("sme");
  const [smeData, setSmeData] = useState<SMEInsightsData | null>(null);
  const [fintechData, setFintechData] = useState<FintechInsightsData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getSMEInsights(), getFintechInsights()])
      .then(([sme, fintech]) => {
        if (cancelled) return;
        setSmeData(sme);
        setFintechData(fintech);
      })
      .catch((err) => {
        console.error("Failed to load dashboard insights:", err);
        if (!cancelled) setError("Couldn't load dashboard data.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Tab switcher */}
      <div className="flex rounded-md border border-sidebar-border bg-sidebar-accent/30 p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {!error && activeTab === "sme" && <SMEInsights data={smeData} />}
      {!error && activeTab === "fintech" && (
        <FintechInsights data={fintechData} />
      )}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex h-56 w-full items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/10 text-xs text-sidebar-foreground/50">
      Loading…
    </div>
  );
}

function StatCards({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-md border border-sidebar-border bg-sidebar-accent/30 p-4"
        >
          <div className="text-2xl font-semibold text-sidebar-foreground">
            {stat.value}
          </div>
          <div className="text-xs leading-tight text-sidebar-foreground/60">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubTabSwitcher<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="mb-2 flex gap-1 rounded-md border border-sidebar-border bg-sidebar-accent/20 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
            active === tab.id
              ? "bg-sidebar text-sidebar-foreground shadow-sm"
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function CategoryBreakdown({ data }: { data: CategoryCount[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="mt-2 flex flex-col divide-y divide-sidebar-border/60 overflow-hidden rounded-md border border-sidebar-border">
      {data.map((item) => {
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 px-3 py-1.5 text-xs"
          >
            <span className="text-sidebar-foreground/80">{item.name}</span>
            <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
              <span className="font-medium text-sidebar-foreground">
                {item.value}
              </span>
              <span className="text-sidebar-foreground/50">
                ({percent.toFixed(1)}%)
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SMEInsights({ data }: { data: SMEInsightsData | null }) {
  const [circularChart, setCircularChart] = useState<CircularChart>("years");
  const [barMetric, setBarMetric] = useState<BarChartMetric>("employees");

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <LoadingBlock />
      </div>
    );
  }

  const circularDataMap: Record<CircularChart, CategoryCount[]> = {
    years: data.years,
    type: data.type,
    forms: data.forms,
    assetSize: data.assetSize,
  };
  const barDataMap: Record<BarChartMetric, CategoryCount[]> = {
    employees: data.employees,
    income: data.income,
  };

  const pieData = circularDataMap[circularChart];
  const barData = barDataMap[barMetric];

  return (
    <div className="flex flex-col gap-4">
      <StatCards
        stats={[
          { label: "SMEs Studied", value: String(data.totalStudied) },
          {
            label: "Municipalities Covered",
            value: String(data.municipalitiesCovered),
          },
        ]}
      />

      {/* Horizontal bar — top municipalities in the research sample */}
      <div>
        <p className="mb-2 text-sm font-medium text-sidebar-foreground/60">
          SME Distribution by Municipality
        </p>
        <div className="h-56 w-full rounded-md border border-sidebar-border bg-sidebar-accent/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.municipalityDistribution}
              layout="vertical"
              margin={{ left: 4, right: 12 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--sidebar-border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--sidebar-foreground)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--sidebar-foreground)" }}
                width={90}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="value"
                fill="var(--sidebar-primary)"
                radius={[0, 3, 3, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1.5 text-[11px] text-sidebar-foreground/50">
          Only the municipalities covered by the DTI research sample.
        </p>
        <CategoryBreakdown data={data.municipalityDistribution} />
      </div>

      {/* Circular (donut) charts — Years / Type / Forms / Asset Size */}
      <div>
        <p className="mb-2 text-sm font-medium text-sidebar-foreground/60">
          Business Profile
        </p>
        <SubTabSwitcher
          tabs={CIRCULAR_CHART_TABS}
          active={circularChart}
          onChange={setCircularChart}
        />
        <div className="h-56 w-full rounded-md border border-sidebar-border bg-sidebar-accent/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  fontSize: 10,
                  color: "var(--sidebar-foreground)",
                }}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CategoryBreakdown data={pieData} />
      </div>

      {/* Vertical bar charts — Employees / Income */}
      <div>
        <p className="mb-2 text-sm font-medium text-sidebar-foreground/60">
          Business Scale
        </p>
        <SubTabSwitcher
          tabs={BAR_CHART_TABS}
          active={barMetric}
          onChange={setBarMetric}
        />
        <div className="h-56 w-full rounded-md border border-sidebar-border bg-sidebar-accent/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--sidebar-border)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--sidebar-foreground)" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--sidebar-foreground)" }}
                width={32}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="value"
                fill="var(--sidebar-primary)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <CategoryBreakdown data={barData} />
      </div>
    </div>
  );
}

function FintechInsights({ data }: { data: FintechInsightsData | null }) {
  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <LoadingBlock />
      </div>
    );
  }

  const breakdownData: CategoryCount[] = data.usageByTechnology.map((t) => ({
    name: t.name,
    value: t.value,
  }));

  return (
    <div className="flex flex-col gap-4">
      <StatCards
        stats={[
          {
            label: "Total Fintech",
            value: String(data.totalTechnologies),
          },
          { label: "Most Used", value: data.mostUsedName ?? "—" },
        ]}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-sidebar-foreground/60">
          SMEs by Financial Technology Used
        </p>
        <div className="h-64 w-full rounded-md border border-sidebar-border bg-sidebar-accent/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.usageByTechnology}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--sidebar-border)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--sidebar-foreground)" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--sidebar-foreground)" }}
                width={32}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {data.usageByTechnology.map((tech) => (
                  <Cell key={tech.name} fill={tech.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <CategoryBreakdown data={breakdownData} />
      </div>

      <p className="text-xs leading-relaxed text-sidebar-foreground/50">
        Counts reflect SMEs with an active record for each technology in the
        current dataset.
      </p>
    </div>
  );
}
