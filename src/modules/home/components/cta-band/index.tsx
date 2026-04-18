import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CtaBand() {
  return (
    <section className="bg-brand-magenta py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase mb-4">
          Comienza Ahora
        </p>
        <h2
          className="font-display text-white mb-8"
          style={{ fontSize: "clamp(40px, 5vw, 80px)" }}
        >
          ¿LISTA PARA SENTIR LA DIFERENCIA?
        </h2>
        <LocalizedClientLink
          href="/store"
          className="inline-block border-2 border-white text-white font-display text-sm tracking-widest px-10 py-4 hover:bg-white hover:text-brand-magenta transition-colors"
        >
          ENCUENTRA TU FÓRMULA
        </LocalizedClientLink>
      </div>
    </section>
  )
}
