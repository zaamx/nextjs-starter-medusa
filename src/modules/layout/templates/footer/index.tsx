import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({ fields: "id, handle, title" })
  const productCategories = await listCategories()

  return (
    <footer className="bg-brand-dark">
      <div className="content-container py-20">
        <div className="grid grid-cols-1 medium:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="medium:col-span-1">
            <LocalizedClientLink href="/">
              <span className="font-display text-3xl text-white tracking-wider">WENOW</span>
            </LocalizedClientLink>
            <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
              Suplementos formulados para tu etapa de vida, respaldados por ciencia.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display text-xs tracking-[0.3em] text-white/40 uppercase mb-6">
              Tienda
            </h3>
            <ul className="space-y-3">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Todos los Productos
                </LocalizedClientLink>
              </li>
              {collections?.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/collections/${c.handle}`}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {c.title}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-xs tracking-[0.3em] text-white/40 uppercase mb-6">
              Empresa
            </h3>
            <ul className="space-y-3">
              {["Nosotros", "Ciencia", "Blog", "Contacto"].map((item) => (
                <li key={item}>
                  <LocalizedClientLink
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-xs tracking-[0.3em] text-white/40 uppercase mb-6">
              Mantente Informado
            </h3>
            <p className="text-sm text-white/40 mb-4">
              Recibe lo último en fórmulas, ciencia y ofertas.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm px-3 py-2 focus:outline-none focus:border-brand-magenta"
              />
              <button
                type="submit"
                className="bg-brand-magenta text-white font-display text-xs tracking-widest px-4 py-2 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                UNIRSE
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col small:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Club WeNow. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {["Política de Privacidad", "Términos de Servicio", "Política de Envío"].map((item) => (
              <a key={item} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
