// src/pages/AcercaDe.tsx
import { Link } from 'react-router-dom'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const VALORES = [
  { num: '01', titulo: 'Excelencia clínica', desc: 'Todo el contenido es revisado por especialistas para garantizar rigor científico y actualización constante.' },
  { num: '02', titulo: 'Acceso universal',   desc: 'Creemos que la educación médica de calidad no debería depender del lugar donde vives o tus recursos.' },
  { num: '03', titulo: 'Comunidad',          desc: 'Construimos una red de profesionales de la salud que aprenden juntos y se apoyan mutuamente.' },
]

const STATS = [
  { valor: '200+', label: 'Cursos disponibles'      },
  { valor: '18K',  label: 'Profesionales activos'   },
  { valor: '80+',  label: 'Especialistas docentes'  },
  { valor: '95%',  label: 'Tasa de satisfacción'    },
]

function AcercaDe() {
  return (
    <div className="bg-[#f8f9ff]">

      {/* ── Hero: asimétrico, sin badge ni gradiente en el texto ── */}
      <div className="border-b border-[#c6c6cd]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <p className="text-[#006398] text-sm font-semibold mb-4">Nuestra misión</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#0b1c30] leading-[1.1]">
              Educación médica de calidad, accesible para todos.
            </h1>
          </div>
          <div className="md:col-span-4">
            <p className="text-[#45464d] text-base leading-relaxed">
              MedicusLearn nació para democratizar la formación médica continua en Latinoamérica, conectando a los mejores especialistas con médicos, residentes y estudiantes de salud.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

        {/* ── Valores: lista editorial, no cards centradas con emoji ── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-16 border-b border-[#c6c6cd]">
          <div className="md:col-span-4">
            <h2 className="text-2xl font-bold text-[#0b1c30]">Lo que nos guía</h2>
          </div>
          <div className="md:col-span-8 space-y-8">
            {VALORES.map(({ num, titulo, desc }) => (
              <div key={num} className="flex gap-5">
                <span className="text-sm font-bold text-[#006398] pt-0.5 flex-shrink-0 w-6">{num}</span>
                <div>
                  <h3 className="text-[#0b1c30] font-semibold mb-1">{titulo}</h3>
                  <p className="text-[#45464d] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats: barra horizontal, no grid de cards con gradiente ── */}
        <section className="py-16 border-b border-[#c6c6cd]">
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            {STATS.map(({ valor, label }) => (
              <div key={label} className="min-w-[120px]">
                <p className="text-4xl font-bold text-[#0b1c30]">{valor}</p>
                <p className="text-[#45464d] text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA: integrado, sin el patrón de dos botones flotando centrados ── */}
        <section className="py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <h2 className="text-2xl font-bold text-[#0b1c30] mb-2">¿Listo para empezar?</h2>
            <p className="text-[#45464d] text-sm">Únete a miles de profesionales que ya están aprendiendo.</p>
          </div>
          <div className="md:col-span-5 flex md:justify-end gap-3">
            <Link
              to="/cursos"
              className="text-[#0b1c30] border border-[#c6c6cd] hover:border-[#006398] px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            >
              Ver cursos
            </Link>
            <Link
              to="/registro"
              className="bg-[#006398] hover:bg-[#00476e] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all inline-flex items-center gap-1.5"
            >
              Crear cuenta
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AcercaDe