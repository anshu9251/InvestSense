import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "../ui/Card";
import { CHART_COLORS, chartTooltipStyle } from "../../utils/chartTheme";
import "./PortfolioChart.css";

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text
            x={x}
            y={y}
            fill="var(--text-primary)"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

function PortfolioChart({ sectorAllocation }) {
    const hasData = sectorAllocation && sectorAllocation.length > 0;

    return (
        <ChartCard title="Portfolio allocation" subtitle="By sector weight">
            {hasData ? (
                <div className="portfolio-chart">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={sectorAllocation}
                                dataKey="value"
                                nameKey="sector"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={95}
                                paddingAngle={sectorAllocation.length > 1 ? 3 : 0}
                                label={renderCustomLabel}
                                labelLine={false}
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {sectorAllocation.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        stroke="none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Value"]}
                                contentStyle={chartTooltipStyle}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="portfolio-chart__legend">
                        {sectorAllocation.map((item, index) => (
                            <div key={item.sector} className="portfolio-chart__legend-item">
                                <span
                                    className="portfolio-chart__legend-dot"
                                    style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="portfolio-chart__legend-label">{item.sector}</span>
                                <span className="portfolio-chart__legend-value">
                                    ₹{item.value.toLocaleString("en-IN")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="empty-state">Add holdings to see sector allocation</p>
            )}
        </ChartCard>
    );
}

export default PortfolioChart;
