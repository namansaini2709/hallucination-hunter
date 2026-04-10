import { useRef } from "react";
import { Link } from "react-router-dom";

import { HeroCube } from "../components/HeroCube";

export function LandingPage() {
  const pointer = useRef({ x: 0, y: 0 });

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    pointer.current = {
      x: (x - 0.5) * 2,
      y: (0.5 - y) * 2,
    };
  };

  const handlePointerLeave = () => {
    pointer.current = { x: 0, y: 0 };
  };

  return (
    <section
      className="single-hero relative min-h-screen overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="single-hero-vignette" />
      <div className="single-hero-shadow-band" />

      <div className="single-hero-inner">
        <div className="single-hero-copy">
          <p className="single-hero-kicker">SOURCE-GROUNDED AI AUDITING</p>
        </div>

        <div className="single-hero-art">
          <p className="single-hero-fill">
            <span>HALLUCINATION</span>
            <span>HUNTER</span>
          </p>

          <HeroCube pointer={pointer} />

          <h1 className="single-hero-outline">
            <span>HALLUCINATION</span>
            <span>HUNTER</span>
          </h1>
        </div>

        <div className="single-hero-bottom">
          <p className="single-hero-subcopy">
            A premium interface for inspecting whether AI answers are faithful,
            drifting, partially supported, hallucinated, or impossible to
            verify against a known source passage.
          </p>

          <div className="single-hero-actions">
            <Link to="/analyze" className="primary-cta">
              Get Started
            </Link>
            <Link to="/analyze" className="secondary-cta">
              Open Workspace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
