import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Full Page Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "contrast(1.05) brightness(1.1)" }}
      >
        <source src="/hunterlanding.mov" type="video/quicktime" />
      </video>

      {/* Get Started Button - Bottom Right */}
      <div className="absolute bottom-12 right-12 z-10">
        <Link 
          to="/analyze" 
          className="primary-cta px-10 py-4 text-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
