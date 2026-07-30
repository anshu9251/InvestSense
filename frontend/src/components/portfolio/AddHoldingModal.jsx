import { useState } from "react";
import "./AddHoldingModal.css";

const SECTORS = ["IT", "Banking", "FMCG", "Pharma", "Auto", "Energy", "Other"];

function AddHoldingModal({ isOpen, onClose, onSubmit }) {
    const [form, setForm] = useState({
        symbol: "",
        quantity: "",
        buy_price: "",
        buy_date: "",
        sector: "Other",
    });
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({
                symbol: form.symbol.trim().toUpperCase(),
                quantity: parseFloat(form.quantity),
                buy_price: parseFloat(form.buy_price),
                buy_date: form.buy_date,
                sector: form.sector,
            });
            setForm({ symbol: "", quantity: "", buy_price: "", buy_date: "", sector: "Other" });
            onClose();
        } catch (err) {
            alert("Failed to add holding: " + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Holding</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="holding-form">
                    <label>
                        Symbol (e.g. RELIANCE.NS)
                        <input type="text" name="symbol" value={form.symbol} onChange={handleChange} required placeholder="RELIANCE.NS" />
                    </label>
                    <label>
                        Quantity
                        <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required min="0.01" step="any" />
                    </label>
                    <label>
                        Buy Price (₹)
                        <input type="number" name="buy_price" value={form.buy_price} onChange={handleChange} required min="0.01" step="any" />
                    </label>
                    <label>
                        Buy Date
                        <input type="date" name="buy_date" value={form.buy_date} onChange={handleChange} required />
                    </label>
                    <label>
                        Sector
                        <select name="sector" value={form.sector} onChange={handleChange}>
                            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Adding..." : "Add Holding"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddHoldingModal;