"use client";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          © {new Date().getFullYear()} Space Station Management
        </p>
        <p className="text-slate-400 text-sm">
          Tema Space • Next.js
        </p>
      </div>
    </footer>
  );
}
