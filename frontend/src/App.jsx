import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AnalyzePage } from "./pages/AnalyzePage";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-hidden text-stone-100">
        <BackgroundScene />
        <div className="relative">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function BackgroundScene() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <div className="grid-haze" />
    </div>
  );
}
