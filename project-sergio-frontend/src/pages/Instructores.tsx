// src/pages/Instructores.tsx
import { Link } from 'react-router-dom'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const INSTRUCTORES = [
  {
    id: 1,
    nombre: 'Dr. Alejandro Vega',
    especialidad: 'Cardiología Intervencionista',
    rol: 'Jefe Clínico de Servicio de Cardiología',
    avatar: 'AV',
    foto: '/assets/images/instructor-1.jpg',
    experiencia: '15 años de práctica',
    hospital: 'Hospital de Cardiología, CDMX',
    certificacion: 'Fellow del American College of Cardiology (FACC)',
    bio: 'Referente nacional en intervencionismo coronario percutáneo y manejo de arritmias complejas guiadas por mapeo electroanatómico.',
    cursoIcon: 'ecg_heart',
    cursoTitulo: 'Cardiología Clínica Avanzada e Intervencionismo',
    acento: '#006398',
  },
  {
    id: 2,
    nombre: 'Dra. Sofía Mendoza',
    especialidad: 'Neurología Clínica',
    rol: 'Coordinadora de Residencia en Neurología',
    avatar: 'SM',
    foto: '/assets/images/instructor-2.jpg',
    experiencia: '12 años de práctica',
    hospital: 'Instituto Nacional de Neurología',
    certificacion: 'Subespecialidad en Enfermedades Desmielinizantes',
    bio: 'Enfocada en neurología del comportamiento y protocolos de código ictus. Ha formado a más de 80 residentes en su programa.',
    cursoIcon: 'neurology',
    cursoTitulo: 'Neurología de Urgencia para Residentes',
    acento: '#8b5cf6',
  },
  {
    id: 3,
    nombre: 'Dr. Carlos Ríos',
    especialidad: 'Pediatría y Neonatología',
    rol: 'Jefe de Cuidados Intensivos Neonatales',
    avatar: 'CR',
    foto: '/assets/images/instructor-3.jpg',
    experiencia: '18 años de práctica',
    hospital: 'Hospital Infantil de México',
    certificacion: 'Instructor certificado en Reanimación Neonatal (NRP)',
    bio: 'Experto en cuidados intensivos neonatales y emergencias pediátricas. Ha formado a más de 200 residentes a lo largo de su carrera.',
    cursoIcon: 'child_care',
    cursoTitulo: 'Pediatría Esencial y Urgencias Pediátricas',
    acento: '#069669',
  },
  {
    id: 4,
    nombre: 'Dra. Paola Ramos',
    especialidad: 'Urgencias y Soporte Vital',
    rol: 'Médico Adjunto del Servicio de Urgencias',
    avatar: 'PR',
    foto: '/assets/images/instructor-4.jpg',
    experiencia: '10 años de práctica',
    hospital: 'Centro Médico Nacional Siglo XXI',
    certificacion: 'Instructora certificada en ATLS y ACLS',
    bio: 'Líder en manejo del trauma mayor y triaje estructurado. Miembro del grupo de trabajo de reanimación cardiopulmonar.',
    cursoIcon: 'emergency',
    cursoTitulo: 'Urgencias y Trauma: Manejo Inicial',
    acento: '#ba1a1a',
  },
  {
    id: 5,
    nombre: 'Dr. Roberto Salinas',
    especialidad: 'Cirugía General',
    rol: 'Cirujano General',
    avatar: 'RS',
    foto: '/assets/images/instructor-5.jpg',
    experiencia: '20 años de práctica',
    hospital: 'Hospital General de México',
    certificacion: 'Autor de dos manuales quirúrgicos de referencia',
    bio: 'Pionero en técnicas de cirugía laparoscópica avanzada en México, con más de 3,000 procedimientos realizados.',
    cursoIcon: 'medical_services',
    cursoTitulo: 'Cirugía Laparoscópica Avanzada',
    acento: '#006398',
  },
]

function InstructorCard({ inst }: { inst: typeof INSTRUCTORES[number] }) {
  return (
    <div className="bg-[#ffffff] border border-[#c6c6cd] rounded shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start gap-4">
          {/* Foto con insignia */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#dce9ff]">
              <img src={inst.foto} alt={inst.nombre} className="w-full h-full object-cover" />
            </div>
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-3xl border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: inst.acento }}
            >
              {inst.avatar}
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${inst.acento}18`, color: inst.acento }}
              >
                {inst.especialidad}
              </span>
            </div>
            <p className="flex items-center gap-1 text-[#45464d] text-xs mb-2">
              <Icon name="military_tech" className="text-[14px]" />
              {inst.experiencia}
            </p>
            <h3 className="text-[#0b1c30] font-bold text-base leading-tight">{inst.nombre}</h3>
            <p className="text-sm font-medium" style={{ color: inst.acento }}>{inst.rol}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="flex items-center gap-2 text-[#45464d] text-xs">
            <Icon name="location_on" className="text-[16px] flex-shrink-0" />
            {inst.hospital}
          </p>
          <p className="flex items-center gap-2 text-[#45464d] text-xs">
            <Icon name="workspace_premium" className="text-[16px] flex-shrink-0" />
            {inst.certificacion}
          </p>
        </div>

        <p className="text-[#45464d] text-sm leading-relaxed mt-4">
          {inst.bio}
        </p>
      </div>

      {/* Footer: curso activo */}
      <Link
        to={`/instructores/${inst.id}`}
        className="flex items-center justify-between gap-3 px-6 py-4 bg-[#eff4ff] border-t border-[#c6c6cd] hover:bg-[#dce9ff] transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#81828b]">Curso activo en plataforma</p>
            <p className="text-[#77818b] text-xs font-semibold truncate">{inst.cursoTitulo}</p>
          </div>
        </div>
        <span
          className="flex-shrink-0 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full flex items-center gap-1 group-hover:gap-1.5 transition-all"
          style={{ backgroundColor: inst.acento }}
        >
          Ver curso 
        </span>
      </Link>
    </div>
  )
}

function Instructores() {
  return (
    <div
      className="bg-[#eff8fa] pb-16"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23c6c6cd' stroke-width='1.5' opacity='0.3'%3E%3Cpath d='M20 15v10M15 20h10'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    >
      {/* ── Header ── */}
    <div className="max-w-8xl mx-auto px-4 sm:px-3 pt-3">
    <div className="relative overflow-hidden border border-[#c6c6cd] bg-[#eff4ff]">
      <img
        src="/assets/images/fondo-header.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-100"
      />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[#006398] text-[10px] font-bold uppercase tracking-wider mb-2">Cuerpo docente</p>
          <h1 className="text-4xl font-bold text-[#0b1c30] mb-3">Nuestros instructores</h1>
          <p className="text-[#45464d] text-sm max-w-xl">
            Especialistas con trayectoria clínica y docente comprobada, en ejercicio activo en algunas de las
            instituciones más importantes del país.
          </p>
        </div>
      </div>
    </div>

      {/* ── Grid de cards ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INSTRUCTORES.map((inst) => (
            <InstructorCard key={inst.id} inst={inst} />
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="border-t border-[#c6c6cd] pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-[#006398] text-[10px] font-bold uppercase tracking-wider mb-1">¿Eres especialista?</p>
            <h3 className="text-[#0b1c30] font-bold text-lg">Únete al cuerpo docente</h3>
            <p className="text-[#45464d] text-sm mt-1 max-w-sm">
              Comparte tu conocimiento clínico con miles de profesionales de la salud.
            </p>
          </div>
          <Link to="/contacto">
            <button className="flex-shrink-0 bg-[#006398] hover:bg-[#00476e] text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap">
              Quiero ser instructor
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Instructores