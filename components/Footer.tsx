import { Flame, Mail, Phone, MapPin } from "lucide-react";
import { categories } from "@/data/categories";

const infoLinks = [
  { label: "Come acquistare", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Contattaci", href: "#contatti" },
  { label: "Condizioni di vendita", href: "#" },
];

export default function Footer() {
  const half = Math.ceil(categories.length / 2);
  const col1 = categories.slice(0, half);
  const col2 = categories.slice(half);

  return (
    <footer id="contatti" className="border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                RICAMBI<span className="text-accent">X</span>STUFE
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Ricambi professionali per stufe a pellet. Spedizione rapida in
              tutta Europa.
            </p>
            <div className="space-y-2.5 text-sm text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Fuoco Vivo Snc</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>info@ricambixstufe.it</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>+39 000 000 0000</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-5">
              Categorie
            </h4>
            <ul className="space-y-2">
              {col1.map((cat) => (
                <li key={cat.id}>
                  <a href={`#${cat.slug}`} className="text-sm text-muted hover:text-accent transition-colors duration-200">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-5 sm:invisible">
              Categorie
            </h4>
            <ul className="space-y-2">
              {col2.map((cat) => (
                <li key={cat.id}>
                  <a href={`#${cat.slug}`} className="text-sm text-muted hover:text-accent transition-colors duration-200">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-5">
              Informazioni
            </h4>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted hover:text-accent transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2">
              {["PayPal", "Visa", "Mastercard"].map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-md bg-stone-50 border border-border text-[10px] font-medium text-muted"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Ricambi X Stufe. Tutti i diritti riservati.
          </p>
          <p className="text-xs text-muted/60">
            P.IVA IT00000000000
          </p>
        </div>
      </div>
    </footer>
  );
}
