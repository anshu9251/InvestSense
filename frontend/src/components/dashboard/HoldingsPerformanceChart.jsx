import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ChartCard } from "../ui/Card";
import { chartTooltipStyle, chartGridStroke, chartAxisStroke } from "../../utils/chartTheme";
import "./HoldingsPerformanceChart.css";

function HoldingsPerformanceChart({ holdings }) {
    const chartData = holdings
        .filter((h) => !h.error)
        .map((h) => ({
            symbol: h.symbol.replace(".NS", "").replace(".BO", ""),
            Invested: h.invested_value,
            Current: h.current_value,
        }));

    return (
        <ChartCard
            title="Invested vs current value"
            subtitle="Per-holding performance comparison"
        >
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                        <XAxis
                            dataKey="symbol"
                            stroke={chartAxisStroke}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke={chartAxisStroke}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                            contentStyle={chartTooltipStyle}
                            cursor={{ fill: "var(--primary-muted)" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }} iconType="circle" iconSize={8} />
                        <Bar dataKey="Invested" fill="var(--chart-8)" radius={[6, 6, 0, 0]} animationDuration={800} />
                        <Bar dataKey="Current" fill="var(--chart-1)" radius={[6, 6, 0, 0]} animationDuration={800} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p className="empty-state">Add holdings to see performance comparison</p>
            )}
        </ChartCard>
    );
}

export default HoldingsPerformanceChart;
