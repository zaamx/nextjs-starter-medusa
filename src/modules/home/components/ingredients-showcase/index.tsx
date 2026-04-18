const stats = [
  { value: "18%", label: "Reducción en marcadores de fatiga" },
  { value: "6%", label: "Aumento en niveles de energía" },
  { value: "14%", label: "Mejora en calidad del sueño" },
  { value: "31%", label: "Mejor función cognitiva" },
]

const points = [
  "Ingredientes clínicamente estudiados",
  "Probado por terceros",
  "Sin aditivos artificiales",
  "Etiquetado transparente",
]

export default function IngredientsShowcase() {
  return (
    <section className="bg-grey-5 py-24">
      <div className="content-container">
        <div className="grid small:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-grey-50 uppercase mb-4">
              Nuestra Fórmula
            </p>
            <h2
              className="font-display text-grey-90 mb-6"
              style={{ fontSize: "clamp(36px, 4vw, 60px)" }}
            >
              FORMULADO CON PROPÓSITO. RESPALDADO POR CIENCIA.
            </h2>
            <p className="text-grey-50 leading-relaxed mb-8">
              Cada fórmula WeNow combina ingredientes clínicamente estudiados en dosis efectivas. Sin rellenos, sin mezclas propietarias — solo formulación transparente diseñada para lo que tu cuerpo necesita.
            </p>
            <ul className="space-y-3">
              {points.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-grey-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ value, label }) => (
              <div key={value} className="bg-white p-8 flex flex-col gap-2">
                <span
                  className="font-display text-brand-magenta"
                  style={{ fontSize: "clamp(40px, 4vw, 64px)" }}
                >
                  {value}
                </span>
                <span className="text-xs text-grey-50 uppercase tracking-wide leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
