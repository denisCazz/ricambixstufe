"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Truck, ShieldCheck, Headphones } from "lucide-react";

const features = [
  { icon: Truck, label: "Spedizione in tutta Europa" },
  { icon: ShieldCheck, label: "Garanzia su ogni prodotto" },
  { icon: Headphones, label: "Assistenza tecnica" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/50 to-background">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-200/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-28">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-accent text-sm font-medium mb-6"
          >
            <Flame className="w-4 h-4" />
            Qualit&agrave; professionale dal 2015
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-foreground"
          >
            Ricambi per
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Stufe a Pellet
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-muted leading-relaxed mb-8 max-w-lg"
          >
            Motoriduttori, ventilatori, resistenze, schede elettroniche e molto
            altro. Spedizione rapida in tutta Europa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-surface-hover hover:border-border-hover transition-all duration-300"
            >
              Contattaci
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 md:mt-16 flex flex-wrap gap-6 md:gap-10"
        >
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
                <f.icon className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
