import { useState, useEffect } from "react";
import { getRiskAnalysis } from "../../api";
import { ChartCard } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import "./RiskScoreCard.css";

function CircularProgress({ score, color }) {
    const size = 140;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="risk-gauge">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
            </svg>
            <div className="risk-gauge__center">
                <span className="risk-gauge__score" style={{ color }}>{score}</span>
                <span className="risk-gauge__max">/ 100</span>
            </div>
        </div>
    );
}

function RiskScoreCard({ holdingsCount }) {
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!holdingsCount) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getRiskAnalysis()
            .then((res) => setRisk(res.data))
            .catch(() => setRisk(null))
            .finally(() => setLoading(false));
    }, [holdingsCount]);

    const getScoreColor = (score) => {
        if (score >= 75) return "var(--success)";
        if (score >= 50) return "var(--warning)";
        if (score >= 25) return "#FB923C";
        return "var(--danger)";
    };

    return (
        <ChartCard title="Risk analysis" subtitle="Portfolio health score">
            {loading ? (
                <div className="risk-loading">
                    <Skeleton variant="card" style={{ height: 180, borderRadius: "50%", width: 180, margin: "0 auto" }} />
                </div>
            ) : !risk ? (
                <p className="empty-state">Add holdings to see your risk profile</p>
            ) : (
                <div className="risk-content">
                    <div className="risk-content__gauge">
                        <CircularProgress
                            score={risk.health_score.score}
                            color={getScoreColor(risk.health_score.score)}
                        />
                        <span
                            className="risk-content__label"
                            style={{ color: getScoreColor(risk.health_score.score) }}
                        >
                            {risk.health_score.label}
                        </span>
                    </div>

                    <div className="risk-metrics">
                        <div className="risk-metric">
                            <span className="risk-metric__name">Diversification</span>
                            <div className="risk-metric__bar-wrap">
                                <div
                                    className="risk-metric__bar"
                                    style={{ width: `${risk.diversification_score}%` }}
                                />
                            </div>
                            <span className="risk-metric__val">{risk.diversification_score}/100</span>
                        </div>
                        <div className="risk-metric">
                            <span className="risk-metric__name">Volatility (annualized)</span>
                            <span className="risk-metric__val">
                                {risk.volatility !== null ? `${risk.volatility}%` : "N/A"}
                            </span>
                        </div>
                        <div className="risk-metric">
                            <span className="risk-metric__name">Holdings</span>
                            <span className="risk-metric__val">{risk.num_holdings}</span>
                        </div>
                    </div>
                </div>
            )}
        </ChartCard>
    );
}

export default RiskScoreCard;
