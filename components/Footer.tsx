import { Flame } from "lucide-react";
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
    <footer className="border-t border-white/5 bg-neutral-950/80">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                RICAMBI<span className="text-accent">X</span>STUFE
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-4">
              Ricambi professionali per stufe a pellet. Spedizione rapida in
              tutta Europa.
            </p>
            <p className="text-xs text-muted/60">
              Fuoco Vivo Snc &mdash; P.IVA IT00000000000
            </p>
          </div>

          {/* Categories col 1 */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Categorie
            </h4>
            <ul className="space-y-2.5">
              {col1.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#${cat.slug}`}
                    className="text-sm text-muted/80 hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories col 2 */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              &nbsp;
            </h4>
            <ul className="space-y-2.5">
              {col2.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#${cat.slug}`}
                    className="text-sm text-muted/80 hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Informazioni
            </h4>
            <ul className="space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted/80 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted/50">
            &copy; {new Date().getFullYear()} Ricambi X Stufe. Tutti i diritti
            riservati.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted/40 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium">
                PayPal
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium">
                Visa
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium">
                Mastercard
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
