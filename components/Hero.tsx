import { ArrowRight, Flame } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-neutral-950 to-neutral-950" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/8 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <Flame className="w-4 h-4" />
            Qualit&agrave; professionale dal 2015
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Ricambi per
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Stufe a Pellet
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted leading-relaxed mb-8 max-w-lg">
            Motoriduttori, ventilatori, resistenze, schede elettroniche e
            molto altro. Spedizione rapida in tutta Europa.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#prodotti"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Esplora il Catalogo
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#contatti"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white font-semibold hover:bg-white/5 hover:border-white/25 transition-all duration-300"
            >
              Contattaci
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
