"use client";

import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Cog,
  Fan,
  Zap,
  Cpu,
  Flame,
} from "lucide-react";

const features = [
  { icon: Truck, label: "Spedizione in tutta Europa" },
  { icon: ShieldCheck, label: "Garanzia su ogni prodotto" },
  { icon: Headphones, label: "Assistenza dedicata" },
];

const categories = [
  { icon: Cog, label: "Motoriduttori" },
  { icon: Fan, label: "Ventilatori" },
  { icon: Zap, label: "Resistenze" },
  { icon: Cpu, label: "Schede" },
  { icon: Flame, label: "Bracieri" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left column — text + search */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-400 text-sm font-medium mb-6"
            >
              <Flame className="w-4 h-4" />
              Qualità professionale dal 2015
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-5 text-white"
            >
              Ricambi per{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Stufe a Pellet
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-stone-400 leading-relaxed mb-8 max-w-lg"
            >
              Motoriduttori, ventilatori, resistenze, schede elettroniche e
              molto altro. Oltre 160 ricambi disponibili con spedizione rapida
              in tutta Europa.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cerca ricambi, codici, modelli..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/25 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href="#prodotti"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Esplora il Catalogo
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contatti"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                Contattaci
              </a>
            </motion.div>
          </div>

          {/* Right column — category cards grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:block"
          >
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  className={`group relative rounded-2xl bg-white/5 border border-white/10 p-5 lg:p-6 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300 cursor-pointer ${
                    i === 4 ? "col-span-2" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center mb-3 group-hover:bg-orange-500/25 transition-colors duration-300">
                    <cat.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm lg:text-base">
                    {cat.label}
                  </h3>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 md:mt-16 pt-8 border-t border-white/10"
        >
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm text-stone-400">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
