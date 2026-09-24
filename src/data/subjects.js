import teoriaComputacionData from './ColoquioTeoriaComputacion.json';
import anatomofisiologiaData from './IntroduccionAnatomofisiologia.json';

export const SUBJECTS = [
  {
    id: 'teoria-computacion',
    title: 'Teoría de la Computación',
    subtitle: 'Coloquio: Lenguajes, Lenguajes Regulares y Gramáticas',
    badge: 'Coloquio',
    icon: '⚡',
    description: 'Estudio sistemático de alfabetos, cadenas, propiedades de lenguajes, expresiones regulares, derivaciones y jerarquía de Chomsky.',
    data: teoriaComputacionData
  },
  {
    id: 'introduccion-anatomofisiologia',
    title: 'Introducción a la Anatomofisiología',
    subtitle: 'Principios, Niveles, Posiciones, Términos y Cavidades',
    badge: 'Anatomía',
    icon: '🫀',
    description: 'Bases morfofisiológicas, complementariedad estructura-función, posiciones de enfermería, planos anatómicos y oclusión de imágenes.',
    data: anatomofisiologiaData
  }
];

export function getSubjectById(id) {
  return SUBJECTS.find(s => s.id === id) || null;
}
