import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import HoldingsTable from "../components/portfolio/HoldingsTable";
import AddHoldingModal from "../components/portfolio/AddHoldingModal";
import SummaryCards from "../components/dashboard/SummaryCards";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import { usePortfolio } from "../hooks/usePortfolio";
import { Button } from "../components/ui";
import { HiOutlinePlus } from "react-icons/hi2";
import "./PortfolioPage.css";

function PortfolioPage() {
    const { holdings, summary, loading, error, addNewHolding, removeHolding } = usePortfolio();
    const [modalOpen, setModalOpen] = useState(false);

    const handleDelete = async (id) => {
        if (window.confirm("Remove this holding?")) {
            await removeHolding(id);
        }
    };

    return (
        <div className="portfolio-page page-shell">
            <Navbar onAddHoldingClick={() => setModalOpen(true)} title="Portfolio" />
            <motion.div
                className="portfolio-body page-content-wide"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                {error && <div className="error-banner">{error}</div>}
                <SummaryCards summary={summary} loading={loading} />

                <div className="portfolio-grid">
                    <div className="ui-table-panel portfolio-table-panel">
                        <div className="ui-table-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <h2 className="ui-table-panel__title">Your holdings</h2>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setModalOpen(true)}
                                icon={HiOutlinePlus}
                            >
                                Add Holding
                            </Button>
                        </div>
                        <HoldingsTable holdings={holdings} loading={loading} onDelete={handleDelete} />
                    </div>
                    <PortfolioChart sectorAllocation={summary?.sector_allocation} />
                </div>
            </motion.div>
            <AddHoldingModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={addNewHolding}
            />
        </div>
    );
}

export default PortfolioPage;
