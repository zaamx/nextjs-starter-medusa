const testimonials = [
  {
    name: "Sarah M.",
    age: 34,
    quote: "He probado innumerables suplementos. WeNow es el primero en el que realmente noté una diferencia en las primeras dos semanas.",
    rating: 5,
  },
  {
    name: "Laura K.",
    age: 48,
    quote: "La fórmula para la perimenopausia ha sido un cambio total para mis niveles de energía y sueño. Por fin me siento yo misma.",
    rating: 5,
  },
  {
    name: "Ana R.",
    age: 41,
    quote: "Me encanta que sea transparente sobre ingredientes y dosis. Como profesional de la salud, eso me importa.",
    rating: 5,
  },
]

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="#A31C5A">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
  )
}

export default function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="content-container">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] text-grey-50 uppercase mb-4">
            Resultados Reales
          </p>
          <h2
            className="font-display text-grey-90"
            style={{ fontSize: "clamp(36px, 4vw, 60px)" }}
          >
            LO QUE DICEN NUESTRAS CLIENTAS
          </h2>
        </div>
        <div className="grid grid-cols-1 medium:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col gap-4">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="text-sm text-grey-70 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-grey-20">
                <div className="w-10 h-10 rounded-full bg-grey-10 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-grey-90">{t.name}</p>
                  <p className="text-xs text-grey-50">{t.age} años</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
