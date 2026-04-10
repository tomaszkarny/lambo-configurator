'use client';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
      <div className="pointer-events-auto">
        <span className="text-sm font-bold tracking-[0.3em] text-white/90 uppercase">
          Lamborghini
        </span>
        <p className="text-[10px] tracking-[0.2em] text-white/55 uppercase mt-0.5">
          Terzo Millennio
        </p>
      </div>
      <div className="pointer-events-auto text-[10px] tracking-widest text-white/50 uppercase">
        Configurator
      </div>
    </header>
  );
}
