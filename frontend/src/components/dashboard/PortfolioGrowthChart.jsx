import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartCard } from "../ui/Card";
import { chartTooltipStyle, chartGridStroke, chartAxisStroke } from "../../utils/chartTheme";
import "./PortfolioGrowthChart.css";

function PortfolioGrowthChart({ holdings, summary }) {
    if (!summary || !holdings?.length) {
        return (
            <ChartCard title="Portfolio growth" subtitle="Investment value trend">
                <p className="empty-state">Add holdings to see growth trend</p>
            </ChartCard>
        );
    }

    const validHoldings = holdings.filter((h) => !h.error);
    const data = validHoldings.map((h, i) => ({
        name: h.symbol.replace(".NS", "").replace(".BO", ""),
        invested: validHoldings.slice(0, i + 1).reduce((s, x) => s + x.invested_value, 0),
        value: validHoldings.slice(0, i + 1).reduce((s, x) => s + x.current_value, 0),
    }));

    if (data.length === 1) {
        data.unshift({ name: "Start", invested: 0, value: 0 });
    }

    return (
        <ChartCard title="Portfolio growth" subtitle="Cumulative value by holding">
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                        <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                    <XAxis dataKey="name" stroke={chartAxisStroke} fontSize={12} tickLine={false} axisLine={false} />
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
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        fill="url(#growthGradient)"
                        animationDuration={1000}
                    />
                    <Area
                        type="monotone"
                        dataKey="invested"
                        stroke="var(--chart-8)"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fill="none"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export default PortfolioGrowthChart;
