// src/pages/Especialidades.tsx
import { Link } from 'react-router-dom'
import { CATEGORIAS, CATEGORIA_ESTILOS } from '../utils/constants'
import type { CategoriaCurso } from '../types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const ESPECIALIDADES_INFO: Record<CategoriaCurso, { descripcion: string; cursos: number; instructores: number }> = {
  Cardiología:  { descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular.', cursos: 14, instructores: 4 },
  Neurología:   { descripcion: 'Trastornos del sistema nervioso central y periférico, desde ACV hasta epilepsia.', cursos: 11, instructores: 3 },
  Pediatría:    { descripcion: 'Atención médica integral del neonato, lactante, niño y adolescente.',              cursos: 9,  instructores: 3 },
  Urgencias:    { descripcion: 'Protocolos de atención en emergencias médicas, trauma y paciente crítico.',        cursos: 8,  instructores: 5 },
  Cirugía:      { descripcion: 'Técnicas quirúrgicas, manejo perioperatorio y cirugía de urgencias.',              cursos: 16, instructores: 6 },
  Oncología:    { descripcion: 'Diagnóstico, estadificación y tratamiento de los tumores más frecuentes.',         cursos: 7,  instructores: 2 },
  Psiquiatría:  { descripcion: 'Trastornos mentales en atención primaria, urgencias y consulta especializada.',    cursos: 6,  instructores: 2 },
  Ginecología:  { descripcion: 'Control prenatal, obstetricia, ginecología oncológica y salud reproductiva.',      cursos: 10, instructores: 4 },
}

function Especialidades() {
  return (
    <div className="bg-[#eff8fa]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23c6c6cd' stroke-width='1.5' opacity='0.3'%3E%3Cpath d='M20 15v10M15 20h10'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    >

      {/* Header */}
    <div className="max-w-8xl mx-auto px-4 sm:px-3 pt-3">
    <div className="relative overflow-hidden border border-[#c6c6cd] bg-[#eff4ff]">
      <img
        src="/assets/images/fondo-header.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-100"
      />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <span className="text-[#006398] text-sm font-semibold mb-2 block">
            Áreas clínicas
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0b1c30] mb-3">
            Especialidades médicas
          </h1>
          <p className="text-[#45464d] text-base max-w-2xl">
            Contenido clínico organizado por área. Encuentra los cursos de tu especialidad y mantente actualizado.
          </p>
        </div>
      </div>
      </div>

      {/* Grid de especialidades */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIAS.map((cat) => {
            const estilos = CATEGORIA_ESTILOS[cat]
            const info    = ESPECIALIDADES_INFO[cat]
            return (
              <Link
                key={cat}
                to={`/cursos?categoria=${cat}`}
                className="group bg-[#e5eeff] border border-[#c6c6cd] rounded overflow-hidden hover:border-[#006398]/30 hover:shadow-xl transition-all duration-300"
              >
              <div className={`h-28 bg-gradient-to-br ${estilos.color} flex items-center justify-center relative overflow-hidden`}>
                {/* Diamantes decorativos */}
                <div className="absolute top-3 left-3 w-5 h-5 rotate-45 bg-white/40 rounded" />
                <div className="absolute bottom-3 right-10 w-8 h-8 rotate-45 bg-white/35 rounded-lg" />

                {/* Círculo detrás del ícono */}
                <div className="absolute w-16 h-16 rounded-3xl bg-white/30" />

                <img src={estilos.icono} alt={`Ícono de ${cat}`} className="relative z-10 w-12 h-12 object-contain" />
              </div>

                <div className="p-5">
                  <h2 className={`text-base font-bold mb-2 group-hover:text-[#006398] transition-colors ${estilos.acento}`}>
                    {cat}
                  </h2>
                  <p className="text-[#45464d] text-xs leading-relaxed mb-4 line-clamp-3">
                    {info.descripcion}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#45464d]/70 pt-3 border-t border-[#c6c6cd]">
                    <span>{info.cursos} cursos</span>
                    <span>{info.instructores} instructores</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Nota final: en línea, no el banner centrado con ícono gigante ── */}
        <div className="mt-16 pt-8 border-t border-[#c6c6cd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Icon name="construction" className="text-[20px] text-[#45464d] mt-0.5" />
            <div>
              <p className="text-[#0b1c30] text-sm font-semibold">Más especialidades próximamente</p>
              <p className="text-[#45464d] text-xs mt-0.5 max-w-md">
                Si quieres ver una especialidad que no está en la lista, cuéntanos.
              </p>
            </div>
          </div>
          <Link
            to="/contacto"
            className="flex-shrink-0 bg-[#006398] hover:bg-[#00476e] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all"
          >
            Sugerir especialidad
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Especialidades