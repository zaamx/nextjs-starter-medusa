const rows = [
  { feature: "Ingredientes clínicamente estudiados", wenow: true, a: false, b: false },
  { feature: "Dosificación transparente (sin mezclas propietarias)", wenow: true, a: false, b: true },
  { feature: "Fórmulas específicas por etapa de vida", wenow: true, a: false, b: false },
  { feature: "Probado por terceros", wenow: true, a: true, b: false },
  { feature: "Sin rellenos artificiales", wenow: true, a: false, b: false },
  { feature: "Opción de suscripción con descuento", wenow: true, a: true, b: true },
]

function CheckIcon({ colored }: { colored?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={colored ? { color: "#A31C5A" } : { color: "rgba(255,255,255,0.4)" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

export default function ComparisonTable() {
  return (
    <section className="bg-brand-dark py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] text-white/40 uppercase mb-4">
            La Diferencia
          </p>
          <h2
            className="font-display text-white"
            style={{ fontSize: "clamp(36px, 4vw, 60px)" }}
          >
            CÓMO NOS COMPARAMOS
          </h2>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs tracking-widest uppercase text-white/40 py-3 w-1/2 font-normal">
                Característica
              </th>
              <th className="text-center text-xs tracking-widest uppercase py-3 font-normal bg-brand-magenta/10 rounded-t" style={{ color: "#A31C5A" }}>
                WeNow
              </th>
              <th className="text-center text-xs tracking-widest uppercase text-white/40 py-3 font-normal">
                Marca HW
              </th>
              <th className="text-center text-xs tracking-widest uppercase text-white/40 py-3 font-normal">
                Marca VH
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="text-white/70 text-sm py-4">{row.feature}</td>
                <td className="text-center py-4 bg-brand-magenta/10">
                  {row.wenow ? <CheckIcon colored /> : <XIcon />}
                </td>
                <td className="text-center py-4">
                  {row.a ? <CheckIcon /> : <XIcon />}
                </td>
                <td className="text-center py-4">
                  {row.b ? <CheckIcon /> : <XIcon />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
