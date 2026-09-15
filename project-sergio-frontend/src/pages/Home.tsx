// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import Button from '../components/ui/Button'
import { CATEGORIA_ESTILOS, CATEGORIAS } from '../utils/constants'
import type { CategoriaCurso, Curso } from '../types'
import CursoCard from '@/components/cursos/CursoCard'

// Ícono Material Symbols — así se usan en todo el mockup de referencia
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

// ── Datos ──────────────────────────────────────────────────

const FEATURED_COURSES: Curso[] = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada e Intervencionismo', categoria: 'Cardiología' as CategoriaCurso, instructor: 'Dr. Sergio César',  duracion: '24h', alumnos: 1840, nivel: 'Avanzado',   esPremium: true,  portadaURL: '/assets/images/heart.png' },
  { id: 2,  nombre: 'Neurología de Urgencia para Residentes',          categoria: 'Neurología'  as CategoriaCurso, instructor: 'Dra. Elena Ramos',   duracion: '18h', alumnos: 2310, nivel: 'Intermedio', esPremium: false, portadaURL: '/assets/images/brain.png' },
  { id: 3,  nombre: 'Pediatría Esencial y Urgencias Pediátricas',      categoria: 'Pediatría'   as CategoriaCurso, instructor: 'Dr. Carlos Ortiz',   duracion: '15h', alumnos: 3120, nivel: 'Básico',     esPremium: false, portadaURL: '/assets/images/baby.png' },
]

const PILARES = [
  { eyebrow: 'Evidencia Grade',   titulo: 'Basado en evidencia',     desc: 'Consensos internacionales ESC, AHA, NICE y ESMO actualizados semestralmente con análisis crítico de ensayos clínicos.', icon: 'menu_book',   foot: 'Revisión por pares',      footIcon: 'check_circle' },
  { eyebrow: 'Simulación HUD',    titulo: 'Casos clínicos activos',  desc: 'Entrena la toma de decisiones críticas con pacientes interactivos, curvas hemodinámicas y evolución de laboratorio en tiempo real.', icon: 'vital_signs', foot: 'Decisión diagnóstica',    footIcon: 'arrow_forward' },
  { eyebrow: 'Flexibilidad 24/7', titulo: 'A tu propio ritmo',       desc: 'Contenido modular fraccionado en cápsulas de 10 a 15 minutos adaptadas a turnos de guardia, pases de visita y desplazamientos.', icon: 'pace',        foot: 'Modo sin conexión',       footIcon: 'cloud_done' },
  { eyebrow: 'Docentes Hospitalarios', titulo: 'Diseño experto',     desc: 'Catedráticos y médicos adjuntos de hospitales universitarios líderes con experiencia clínica asistencial en primera línea.', icon: 'clinical_notes', foot: 'Certificado verificado', footIcon: 'workspace_premium' },
]


// ── Página ─────────────────────────────────────────────────

function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="font-body text-body-md text-on-surface bg-surface">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-primary-container text-on-primary py-16 lg:py-20">
          <img
            src="/assets/images/hero-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-tertiary-fixed/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Columna izquierda */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded bg-surface-container-highest/20 backdrop-blur-md">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-green-300">
                  Plataforma de Educación Médica Continua
                </span>
              </div>

              <h1 className="font-headline text-display text-on-primary max-w-2xl">
                Aprende medicina <br />
                <span className="italic font-normal text-transparent bg-clip-text bg-blue-300 from-tertiary-fixed via-secondary-container to-secondary-fixed">
                  al siguiente nivel.
                </span>
              </h1>

              <p className="font-body text-body-lg text-white max-w-xl mt-5">
                Cursos clínicos de alta resolución diagnóstica para especialistas, médicos residentes y
                profesionales del cuidado crítico. Actualízate con los referentes de cada disciplina.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? '/cursos' : '/registro'}
                  className="px-7 py-3.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-label-lg hover:bg-tertiary-fixed-dim hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <span>{isAuthenticated ? 'Explorar cursos' : 'Comenzar gratis'}</span>
                </Link>
                <Link
                  to="/cursos"
                  className="px-7 py-3.5 rounded-full bg-surface-container-highest/10 hover:bg-surface-container-highest/25 text-on-primary font-label-lg text-label-lg backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <span>Explorar catálogo</span>
                </Link>
              </div>

              <div className="pt-6 mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-tertiary-fixed">
                    <Icon name="verified" className="text-[18px]" />
                    <span className="font-headline text-headline-sm text-on-primary">18,400+ profesionales activos</span>
                  </div>
                  <span className="font-body text-body-sm text-white">
                    Contenido basado en evidencia estricta / Metodología GRADE
                  </span>
                </div>
              </div>
            </div>

            {/* Columna derecha — HUD clínico */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 lg:-mr-12 xl:-mr-24">
              <img
                src="/assets/images/monitor-clinico.png"
                alt="Escritorio de estudio con libros de medicina, apuntes y estetoscopio"
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:-bottom-6 sm:-left-6 sm:w-auto rounded-2xl bg-surface-container-lowest text-on-surface p-3 shadow-xl flex items-center gap-3 border border-outline-variant">
                <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">play_circle</span>
                </div>
                <div>
                  <div className="font-headline text-headline-sm text-on-surface leading-tight">+200 cursos en video</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Actualizados por especialistas activos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 4 PILARES ═════════════════════════════════════════ */}
      <section className="relative w-full bg-surface py-20 overflow-hidden">
          <img
            src="/assets/images/hero1-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
              Rigor Clínico de Precisión
            </span>
            <h2 className="font-headline text-headline-xl text-on-surface mt-2">
              La evolución del razonamiento médico continuo
            </h2>
            <p className="font-body text-body-md text-on-surface-variant mt-3">
              Diseñado por y para médicos que demandan síntesis operativa, actualización diagnóstica y aplicación real en guardia hospitalaria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILARES.map((p) => (
              <div key={p.titulo} className="rounded bg-surface-container-lowest border border-outline-variant p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low text-secondary flex items-center justify-center mb-6">
                    <Icon name={p.icon} className="text-[28px]" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                    {p.eyebrow}
                  </span>
                  <h3 className="font-headline text-headline-sm text-on-surface mt-3 mb-2">{p.titulo}</h3>
                  <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
                </div>
                <div className="pt-6 mt-6 flex items-center gap-2 font-label-sm text-label-sm text-secondary">
                  <span>{p.foot}</span>
                  <Icon name={p.footIcon} className="text-[16px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ESPECIALIDADES ════════════════════════════════════ */}
      <section className="relative w-full bg-surface-container-low py-20 overflow-hidden">

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                Directorio de Competencias
              </span>
              <h2 className="font-headline text-headline-xl text-on-surface mt-1">Explora por especialidad médica</h2>
            </div>
            <Link to="/especialidades" className="font-label-lg text-label-lg text-secondary hover:text-on-secondary-container flex items-center gap-1.5 transition-colors">
              <span>Ver todas las subespecialidades</span>
              <Icon name="chevron_right" className="text-[18px]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIAS.map((cat) => {
              const estilos = CATEGORIA_ESTILOS[cat as CategoriaCurso]
              return (
                <Link
                  key={cat}
                  to={`/cursos?categoria=${cat}`}
                  className="group p-5 rounded border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high transition-all shadow-sm flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-3xl bg-surface-container-low group-hover:bg-secondary-fixed flex items-center justify-center transition-colors">
                    <img src={estilos?.icono} alt={`Ícono de ${cat}`} className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <h3 className={`font-headline text-headline-sm group-hover:text-secondary transition-colors ${estilos?.acento ?? 'text-on-surface'}`}>
                      {cat}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ CURSOS DESTACADOS ═════════════════════════════════ */}
      <section className="relative w-full bg-surface py-20 overflow-hidden">
          <img
            src="/assets/images/hero2-bg.png"
            alt=""
            className="absolute top-0 w-full h-full object-cover opacity-60"
          />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                Catálogo Acreditado ECMEC®
              </span>
              <h2 className="font-headline text-headline-xl text-on-surface mt-1">Cursos clínicos destacados</h2>
              <p className="font-body text-body-md text-on-surface-variant mt-2">
                Capacitación intensiva con certificación CME baremable para bolsas de empleo y oposiciones.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-label-md text-label-md">Todos los niveles</button>
              <button className="px-4 py-2 rounded-full bg-surface-container font-label-md text-label-md text-on-surface hover:bg-surface-variant transition-colors">Residencia</button>
              <button className="px-4 py-2 rounded-full bg-surface-container font-label-md text-label-md text-on-surface hover:bg-surface-variant transition-colors">Especialistas</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_COURSES.map((curso) => (
              <CursoCard key={curso.id} curso={curso} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home