export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 space-bg-gradient" />
      
      {/* Stars */}
      <div className="stars space-bg-stars absolute inset-0" />
      
      {/* Animated Nebula */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl animate-pulse space-bg-nebula-a" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 space-bg-nebula-b" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl space-bg-nebula-c" />
      
      {/* Shooting Star */}
      <div className="shooting-star" />
    </div>
  );
}
