/**
 * HydroYield - AIoT Decision-Support System for Hydroponic Yield Intelligence
 * Main Application Component
 */

import { useState } from "react";
import { Sprout } from "lucide-react";
import { DashboardPage } from "./pages/DashboardPage";
import { ManualPredictPage } from "./pages/ManualPredictPage";
import { AutoPredictPage } from "./pages/AutoPredictPage";
import { HistoryPage } from "./pages/HistoryPage";

type Page = "dashboard" | "manual" | "auto" | "history";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [demoMode, setDemoMode] = useState(true); // Start in demo mode

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage demoMode={demoMode} />;
      case "manual":
        return <ManualPredictPage demoMode={demoMode} />;
      case "auto":
        return <AutoPredictPage demoMode={demoMode} />;
      case "history":
        return <HistoryPage demoMode={demoMode} />;
      default:
        return <DashboardPage demoMode={demoMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HydroYield</h1>
                <p className="text-xs text-gray-500">AIoT Yield Intelligence</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1">
              <NavButton
                active={currentPage === "dashboard"}
                onClick={() => setCurrentPage("dashboard")}
              >
                Dashboard
              </NavButton>
              <NavButton
                active={currentPage === "manual"}
                onClick={() => setCurrentPage("manual")}
              >
                Manual Predict
              </NavButton>
              <NavButton
                active={currentPage === "auto"}
                onClick={() => setCurrentPage("auto")}
              >
                Auto Predict
              </NavButton>
              <NavButton
                active={currentPage === "history"}
                onClick={() => setCurrentPage("history")}
              >
                History
              </NavButton>
            </nav>

            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="rounded"
                />
                Demo Mode
              </label>
              {demoMode && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                  DEMO
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {demoMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Using mock data. To connect to the real backend, uncheck "Demo Mode" and ensure
            the FastAPI server is running at <code className="bg-yellow-100 px-1 rounded">http://localhost:8000</code>
          </div>
        )}
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-sm text-gray-600 text-center">
            <p>
              <strong>HydroYield v1.0</strong> - Production AIoT Decision-Support System for Hydroponic Farming
            </p>
            <p className="text-xs mt-1">
              This is a decision-support tool only. Not for automated control. Consult agronomic expertise before making changes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}
