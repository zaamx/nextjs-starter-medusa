"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"

const faqs = [
  // {
  //   q: "¿Cómo sé qué fórmula es la correcta para mí?",
  //   a: "Cada fórmula WeNow está diseñada para una etapa de vida específica. ESSENTIALS PRIMARIO es para mujeres de 18–45, ESSENTIALS MEDIANA EDAD para perimenopausia (40–55), y ESSENTIALS POSMENOPAUSIA para mujeres posmenopáusicas.",
  // },
  {
    q: "¿Sus suplementos son probados por terceros?",
    a: "Sí. Todas las fórmulas WeNow son analizadas por laboratorios independientes para pureza, potencia y seguridad. Los certificados de análisis están disponibles a petición.",
  },
  {
    q: "¿Cuánto tiempo hasta ver resultados?",
    a: "La mayoría de las clientas reportan cambios en energía y calidad del sueño dentro de 2–4 semanas de uso constante. Los beneficios completos generalmente aparecen después de 8–12 semanas.",
  },
  {
    q: "¿Qué es la opción Suscríbete y Ahorra?",
    a: "Suscríbete y Ahorra te permite recibir tu fórmula de forma recurrente con descuento. Puedes pausar, saltar o cancelar en cualquier momento.",
  },
  {
    q: "¿Hay efectos secundarios?",
    a: "Los suplementos WeNow están formulados con ingredientes generalmente bien tolerados. Recomendamos consultar a tu médico si estás embarazada, en lactancia o tomando medicamentos.",
  }
]

export default function FaqSection() {
  return (
    <section className="bg-grey-5 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] text-grey-50 uppercase mb-4">
            ¿Tienes Preguntas?
          </p>
          <h2
            className="font-display text-grey-90"
            style={{ fontSize: "clamp(36px, 4vw, 60px)" }}
          >
            PREGUNTAS FRECUENTES
          </h2>
        </div>

        <AccordionPrimitive.Root type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionPrimitive.Item
              key={i}
              value={`faq-${i}`}
              className="border-b border-grey-20"
            >
              <AccordionPrimitive.Header>
                <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between py-5 text-left text-sm font-medium text-grey-90 hover:text-brand-magenta transition-colors">
                  {faq.q}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 shrink-0 ml-4 transition-transform group-data-[state=open]:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden text-sm text-grey-50 leading-relaxed radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open">
                <p className="pb-5">{faq.a}</p>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </section>
  )
}
