'use client';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
      <div className="pointer-events-auto">
        <h1 className="text-sm font-bold tracking-[0.3em] text-white/90 uppercase">
          Lamborghini
        </h1>
        <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase mt-0.5">
          Terzo Millennio
        </p>
      </div>
      <div className="pointer-events-auto text-[10px] tracking-widest text-white/30 uppercase">
        Configurator
      </div>
    </header>
  );
}
