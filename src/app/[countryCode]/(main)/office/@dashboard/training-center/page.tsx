"use client";
import { useState } from "react";

const mockLearningPaths = [
  {
    title: "Inicio Rápido",
    description: "Aprende los fundamentos del negocio y cómo empezar.",
    progress: 100,
    certified: true,
  },
  {
    title: "Ventas y Prospección",
    description: "Técnicas para encontrar y convertir prospectos.",
    progress: 60,
    certified: false,
  },
  {
    title: "Liderazgo y Duplicación",
    description: "Desarrolla habilidades de liderazgo y enseña a tu equipo.",
    progress: 30,
    certified: false,
  },
];

const mockExams = [
  { name: "Examen Básico", status: "Aprobado", score: 92 },
  { name: "Examen de Ventas", status: "Pendiente", score: null },
  { name: "Certificación de Liderazgo", status: "Pendiente", score: null },
];

const mockGamification = {
  level: 3,
  points: 850,
  nextLevel: 1000,
  badges: [
    { name: "Completó Inicio Rápido", icon: "🏁" },
    { name: "Primer Referido", icon: "🎉" },
    { name: "10 Lecciones Completadas", icon: "📚" },
  ],
};

export default function TrainingCenterPage() {
  const [selectedPath, setSelectedPath] = useState(0);

  return (
    <div className="relative p-8 max-w-3xl mx-auto">
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center pointer-events-auto">
        <span className="text-3xl font-bold text-gray-700">Próximamente</span>
      </div>
      {/* Page content below (will be covered by overlay) */}
      <h1 className="text-2xl font-bold mb-2">Centro de Formación</h1>
      <p className="text-sm text-gray-500 mb-8">
        Capacitación continua: rutas de aprendizaje, exámenes, certificaciones y gamificación.
      </p>

      {/* Learning Paths */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Rutas de Aprendizaje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mockLearningPaths.map((path, idx) => (
            <div
              key={idx}
              className={`rounded-lg border-2 ${selectedPath === idx ? "border-blue-500" : "border-gray-200"} bg-white shadow p-4 cursor-pointer transition hover:shadow-lg`}
              onClick={() => setSelectedPath(idx)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base">{path.title}</h3>
                {path.certified && <span className="text-green-600 text-xs font-bold ml-2">Certificado</span>}
              </div>
              <p className="text-xs text-gray-500 mb-3">{path.description}</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${path.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">Progreso: {path.progress}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Exams & Certifications */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Exámenes y Certificaciones</h2>
        <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Examen</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Estado</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {mockExams.map((exam, idx) => (
              <tr key={idx} className="border-t border-gray-100">
                <td className="px-4 py-2">{exam.name}</td>
                <td className="px-4 py-2">
                  {exam.status === "Aprobado" ? (
                    <span className="text-green-600 font-semibold">Aprobado</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">Pendiente</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {exam.score !== null ? (
                    <span className="font-mono">{exam.score}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress & Gamification */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Progreso y Gamificación</h2>
        <div className="flex items-center gap-8 mb-4">
          <div>
            <div className="text-xs text-gray-500">Nivel</div>
            <div className="text-2xl font-bold text-blue-600">{mockGamification.level}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Puntos</div>
            <div className="text-2xl font-bold text-purple-600">{mockGamification.points}</div>
            <div className="text-xs text-gray-400">Próximo nivel: {mockGamification.nextLevel} pts</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Insignias</div>
            <div className="flex gap-2">
              {mockGamification.badges.map((badge, idx) => (
                <span key={idx} title={badge.name} className="text-xl" role="img">{badge.icon}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all"
            style={{ width: `${(mockGamification.points / mockGamification.nextLevel) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-2">¡Sigue aprendiendo para subir de nivel y ganar más insignias!</div>
      </div>
    </div>
  );
} 