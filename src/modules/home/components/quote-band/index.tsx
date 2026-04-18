const pressLogos = ["MOMMY", "TUSC", "FITTInsider", "WELLNESS"]

export default function QuoteBand() {
  return (
    <section className="bg-brand-dark py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <blockquote>
          <p
            className="font-display text-white leading-tight"
            style={{ fontSize: "clamp(28px, 4vw, 56px)" }}
          >
            &ldquo;LOS SUPLEMENTOS YA NO SON SOLO UNA COSA DE NICHO. ES UN FENÓMENO COMPLETAMENTE MAINSTREAM.&rdquo;
          </p>
        </blockquote>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-10">
          {pressLogos.map((name) => (
            <span
              key={name}
              className="font-display text-white/30 text-sm tracking-[0.3em] hover:text-white/60 transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
