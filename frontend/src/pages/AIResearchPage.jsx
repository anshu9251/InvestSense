import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import AllInsights from "../components/dashboard/AllInsights";
import "./AIResearchPage.css";

function AIResearchPage() {
    const [searchParams] = useSearchParams();
    const initialSymbol = searchParams.get("symbol") || "";

    return (
        <div className="research-page">
            <Navbar title="AI Research" />
            <div className="research-body">
                <AllInsights initialSymbol={initialSymbol} />
            </div>
        </div>
    );
}

export default AIResearchPage;