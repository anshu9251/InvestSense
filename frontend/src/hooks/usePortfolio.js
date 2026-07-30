import { useState, useEffect, useCallback } from "react";
import { getPortfolio, addHolding, deleteHolding } from "../api";

export function usePortfolio() {
    const [holdings, setHoldings] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPortfolio = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPortfolio();
            setHoldings(res.data.holdings);
            setSummary(res.data.summary);
            setError(null);
        } catch (err) {
            setError("Could not load portfolio. Is the backend running on port 8000?");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolio();
        window.addEventListener("portfolio-updated", fetchPortfolio);
        return () => window.removeEventListener("portfolio-updated", fetchPortfolio);
    }, [fetchPortfolio]);

    const addNewHolding = async (holdingData) => {
        await addHolding(holdingData);
        await fetchPortfolio();
    };

    const removeHolding = async (id) => {
        await deleteHolding(id);
        await fetchPortfolio();
    };

    return { holdings, summary, loading, error, addNewHolding, removeHolding, refresh: fetchPortfolio };
}