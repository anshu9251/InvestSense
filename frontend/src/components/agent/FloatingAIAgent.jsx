import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FiSend,
    FiX,
    FiChevronDown,
    FiTrendingUp,
    FiStar,
    FiPlusCircle,
    FiCompass,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiExternalLink
} from "react-icons/fi";
import {
    sendAgentCommand,
    addToWatchlist,
    removeFromWatchlist,
    addHolding,
    getPortfolio,
    deleteHolding,
    getQuote
} from "../../api";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import logoImg from "../../assets/LOGO.png";
import "./FloatingAIAgent.css";

// Sleek modern AI Bot Head icon SVG
const ActualBotIcon = ({ className }) => (
    <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v3" />
        <circle cx="12" cy="2" r="1" fill="currentColor" />
        <rect x="4" y="5" width="16" height="12" rx="3" />
        <circle cx="9" cy="11" r="1.5" fill="currentColor" />
        <circle cx="15" cy="11" r="1.5" fill="currentColor" />
        <path d="M9 14.5h6" />
        <path d="M2 9.5v3" />
        <path d="M22 9.5v3" />
        <path d="M8 17v2.5a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5V17" />
    </svg>
);

const POPULAR_STOCKS = [
    { symbol: "RELIANCE.NS", name: "Reliance Industries", price: "2450.50", sector: "Energy" },
    { symbol: "TCS.NS", name: "Tata Consultancy", price: "3920.10", sector: "IT" },
    { symbol: "INFY.NS", name: "Infosys Ltd", price: "1840.00", sector: "IT" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank", price: "1680.25", sector: "Banking" },
    { symbol: "AAPL", name: "Apple Inc.", price: "224.30", sector: "IT" },
    { symbol: "NVDA", name: "NVIDIA Corp", price: "118.50", sector: "IT" }
];

export default function FloatingAIAgent() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const getWelcomeMessage = () => ({
        id: `welcome-${Date.now()}`,
        sender: "agent",
        text: "Hello! I'm your InvestSense AI Assistant. How can I help you manage your portfolio or watchlist today?",
        type: "welcome",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    const [messages, setMessages] = useState([getWelcomeMessage()]);

    const navigate = useNavigate();
    const location = useLocation();
    const messagesEndRef = useRef(null);

    // Reset chat history when user logs in or switches account
    useEffect(() => {
        setMessages([getWelcomeMessage()]);
        setIsOpen(false);
    }, [user?.id, user?.email]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const appendMessage = (msg) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now() + Math.random().toString(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                ...msg
            }
        ]);
    };

    const handleExecuteAction = async (action, params) => {
        if (!action) return;

        try {
            if (action === "NAVIGATE" && params?.path) {
                navigate(params.path);
                appendMessage({
                    sender: "system",
                    text: `Navigated to ${params.label || params.path}`,
                    status: "success"
                });
            } else if (action === "ADD_WATCHLIST" && params?.symbol) {
                const sym = params.symbol.toUpperCase();
                await addToWatchlist(sym);
                window.dispatchEvent(new Event("watchlist-updated"));
                appendMessage({
                    sender: "system",
                    text: `Successfully added ${sym} to Watchlist!`,
                    status: "success"
                });
            } else if (action === "REMOVE_WATCHLIST" && params?.symbol) {
                const sym = params.symbol.toUpperCase();
                await removeFromWatchlist(sym);
                window.dispatchEvent(new Event("watchlist-updated"));
                appendMessage({
                    sender: "system",
                    text: `Removed ${sym} from Watchlist.`,
                    status: "info"
                });
            } else if (action === "ADD_HOLDING" && params?.symbol) {
                const todayStr = new Date().toISOString().split("T")[0];
                const validSectors = ["IT", "Banking", "FMCG", "Pharma", "Auto", "Energy", "Other"];
                let sector = params.sector || "Other";
                if (!validSectors.includes(sector)) {
                    if (sector === "Technology") sector = "IT";
                    else if (sector === "Finance") sector = "Banking";
                    else sector = "Other";
                }

                const holdingPayload = {
                    symbol: params.symbol.toUpperCase(),
                    quantity: Number(params.quantity) || 1,
                    buy_price: Number(params.buy_price) || 100,
                    buy_date: params.buy_date || todayStr,
                    sector: sector
                };
                await addHolding(holdingPayload);
                window.dispatchEvent(new Event("portfolio-updated"));
                appendMessage({
                    sender: "system",
                    text: `Added ${holdingPayload.quantity} shares of ${holdingPayload.symbol} @ ₹${holdingPayload.buy_price} to your Portfolio!`,
                    status: "success"
                });
            } else if ((action === "DELETE_HOLDING" || action === "REMOVE_HOLDING") && params?.symbol) {
                const searchSym = params.symbol.toUpperCase().replace(".NS", "").replace(".BO", "");
                const res = await getPortfolio();
                const holdings = res.data?.holdings || [];

                const target = holdings.find((h) => {
                    const cleanH = h.symbol.toUpperCase().replace(".NS", "").replace(".BO", "");
                    return cleanH === searchSym || h.symbol.toUpperCase() === params.symbol.toUpperCase();
                });

                if (target) {
                    await deleteHolding(target.id);
                    window.dispatchEvent(new Event("portfolio-updated"));
                    appendMessage({
                        sender: "system",
                        text: `Successfully removed ${target.symbol} from your portfolio!`,
                        status: "success"
                    });
                } else {
                    appendMessage({
                        sender: "system",
                        text: `Could not find stock ${params.symbol} in your active portfolio holdings.`,
                        status: "error"
                    });
                }
            } else if (action === "GET_QUOTE" && params?.symbol) {
                const res = await getQuote(params.symbol);
                const q = res.data;
                if (q.error) {
                    appendMessage({
                        sender: "agent",
                        text: `Could not fetch quote for ${params.symbol}: ${q.error}`,
                        status: "error"
                    });
                } else {
                    appendMessage({
                        sender: "agent",
                        type: "quote_card",
                        quote: q
                    });
                }
            } else if (action === "RUN_RESEARCH" && params?.symbol) {
                navigate(`/ai-research?symbol=${params.symbol}`);
                appendMessage({
                    sender: "system",
                    text: `Opening AI Research page for ${params.symbol}...`,
                    status: "success"
                });
            } else if (action === "SHOW_POPULAR") {
                appendMessage({
                    sender: "agent",
                    type: "popular_stocks"
                });
            }
        } catch (err) {
            appendMessage({
                sender: "system",
                text: `Action failed: ${err.response?.data?.detail || err.message}`,
                status: "error"
            });
        }
    };

    const handleSend = async (textToSend) => {
        const query = textToSend || input;
        if (!query.trim() || loading) return;

        setInput("");
        appendMessage({ sender: "user", text: query });
        setLoading(true);

        try {
            const res = await sendAgentCommand(query, location.pathname);
            const { reply, action, params } = res.data;

            appendMessage({
                sender: "agent",
                text: reply,
                action,
                params
            });

            if (action && action !== "CHAT") {
                await handleExecuteAction(action, params);
            }
        } catch (err) {
            appendMessage({
                sender: "agent",
                text: "Sorry, I had trouble processing that request. Please try again.",
                status: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (actionText) => {
        handleSend(actionText);
    };

    return (
        <div className="ai-floating-widget">
            {/* Draggable & Sleek Circular AI Trigger Button */}
            {!isOpen && (
                <motion.button
                    drag
                    dragConstraints={{
                        top: -(window.innerHeight - 140),
                        bottom: 20,
                        left: -(window.innerWidth - 70),
                        right: 20,
                    }}
                    dragElastic={0.05}
                    dragMomentum={false}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="ai-trigger-btn"
                    onClick={() => setIsOpen(true)}
                    title="Drag anywhere or tap to open AI Assistant"
                >
                    <ActualBotIcon className="ai-trigger-icon" />
                    <span className="ai-trigger-online-dot"></span>
                </motion.button>
            )}

            {/* Expandable Chat Popup Panel */}
            {isOpen && (
                <div className="ai-chat-panel">
                    {/* Header */}
                    <div className="ai-panel-header">
                        <div className="ai-header-left">
                            <div className="ai-avatar-pulse">
                                <img src={logoImg} alt="InvestSense AI" className="ai-avatar-img" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', borderRadius: '50%' }} />
                                <span className="ai-status-dot"></span>
                            </div>
                            <div>
                                <h3 className="ai-panel-title">InvestSense Assistant</h3>
                                <p className="ai-panel-subtitle">UI Action Copilot • Llama 3.3</p>
                            </div>
                        </div>
                        <button
                            className="ai-close-btn"
                            onClick={() => setIsOpen(false)}
                            title="Minimize Assistant"
                        >
                            <FiChevronDown />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="ai-panel-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`ai-message-wrapper ${msg.sender === "user" ? "user" : msg.sender === "system" ? "system" : "agent"}`}
                            >
                                {msg.sender === "agent" && (
                                    <div className="ai-msg-avatar">
                                        <ActualBotIcon />
                                    </div>
                                )}

                                <div className="ai-msg-bubble">
                                    {msg.text && <p className="ai-msg-text">{msg.text}</p>}

                                    {/* Embedded Quote Card */}
                                    {msg.type === "quote_card" && msg.quote && (
                                        <div className="ai-embedded-quote">
                                            <div className="ai-eq-header">
                                                <strong>{msg.quote.symbol}</strong>
                                                <span className="ai-eq-name">{msg.quote.company_name}</span>
                                            </div>
                                            <div className="ai-eq-price-row">
                                                <span className="ai-eq-price">₹{msg.quote.current_price}</span>
                                                <span className={`ai-eq-change ${msg.quote.day_change_percent >= 0 ? "pos" : "neg"}`}>
                                                    {msg.quote.day_change_percent >= 0 ? "+" : ""}{msg.quote.day_change_percent}%
                                                </span>
                                            </div>
                                            <div className="ai-eq-actions">
                                                <button
                                                    onClick={() => handleExecuteAction("ADD_WATCHLIST", { symbol: msg.quote.symbol })}
                                                    className="ai-card-act-btn"
                                                >
                                                    + Watchlist
                                                </button>
                                                <button
                                                    onClick={() => handleExecuteAction("RUN_RESEARCH", { symbol: msg.quote.symbol })}
                                                    className="ai-card-act-btn highlight"
                                                >
                                                    Research
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Popular Stocks Grid Card */}
                                    {msg.type === "popular_stocks" && (
                                        <div className="ai-popular-grid">
                                            <div className="ai-pop-title">Popular Trending Stocks</div>
                                            {POPULAR_STOCKS.map((stock) => (
                                                <div key={stock.symbol} className="ai-pop-item">
                                                    <div className="ai-pop-info">
                                                        <span className="ai-pop-symbol">{stock.symbol}</span>
                                                        <span className="ai-pop-price">₹{stock.price}</span>
                                                    </div>
                                                    <div className="ai-pop-btns">
                                                        <button
                                                            onClick={() => handleExecuteAction("ADD_WATCHLIST", { symbol: stock.symbol })}
                                                            title="Add to Watchlist"
                                                            className="ai-pop-btn"
                                                        >
                                                            <FiStar /> Watch
                                                        </button>
                                                        <button
                                                            onClick={() => handleExecuteAction("ADD_HOLDING", { symbol: stock.symbol, quantity: 1, buy_price: parseFloat(stock.price), sector: stock.sector })}
                                                            title="Add 1 Share to Portfolio"
                                                            className="ai-pop-btn buy"
                                                        >
                                                            <FiPlusCircle /> Buy 1
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <span className="ai-msg-time">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-message-wrapper agent">
                                <div className="ai-msg-avatar">
                                    <ActualBotIcon />
                                </div>
                                <div className="ai-msg-bubble loading">
                                    <span className="ai-typing-dot"></span>
                                    <span className="ai-typing-dot"></span>
                                    <span className="ai-typing-dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Action Chips */}
                    <div className="ai-suggestions-row">
                        <button onClick={() => handleQuickAction("Add INFY.NS to watchlist")} className="ai-chip">
                            <FiStar /> Add INFY
                        </button>
                        <button onClick={() => handleQuickAction("Add 10 shares of RELIANCE.NS at 2450 to portfolio")} className="ai-chip">
                            <FiPlusCircle /> Buy RELIANCE
                        </button>
                        <button onClick={() => handleQuickAction("Show popular stocks")} className="ai-chip">
                            <FiTrendingUp /> Popular Stocks
                        </button>
                        <button onClick={() => handleQuickAction("Go to markets page")} className="ai-chip">
                            <FiCompass /> Go to Markets
                        </button>
                    </div>

                    {/* Input Footer */}
                    <form
                        className="ai-panel-footer"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Tell agent: 'Add AAPL to watchlist', 'Buy 5 TCS', etc..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" disabled={!input.trim() || loading}>
                            <FiSend />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
