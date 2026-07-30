import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import SummaryCards from "../components/dashboard/SummaryCards";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import RiskScoreCard from "../components/dashboard/RiskScoreCard";
import HoldingsPerformanceChart from "../components/dashboard/HoldingsPerformanceChart";
import PortfolioGrowthChart from "../components/dashboard/PortfolioGrowthChart";
import TopHoldings from "../components/dashboard/TopHoldings";
import { usePortfolio } from "../hooks/usePortfolio";
import "./DashboardPage.css";

function DashboardPage() {
    const { holdings, summary, error, loading } = usePortfolio();

    return (
        <div className="dashboard-page page-shell">
            <Navbar title="Dashboard" />
            <motion.div
                className="dashboard-body page-content-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {error && <div className="error-banner">{error}</div>}
                <SummaryCards summary={summary} loading={loading} />

                <div className="dashboard-grid dashboard-grid--2">
                    <PortfolioChart sectorAllocation={summary?.sector_allocation} />
                    <RiskScoreCard holdingsCount={holdings.length} />
                </div>

                <div className="dashboard-grid dashboard-grid--2">
                    <PortfolioGrowthChart holdings={holdings} summary={summary} />
                    <TopHoldings holdings={holdings} />
                </div>

                <div className="dashboard-grid dashboard-grid--full">
                    <HoldingsPerformanceChart holdings={holdings} />
                </div>
            </motion.div>
        </div>
    );
}

export default DashboardPage;
