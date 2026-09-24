import teoriaComputacionData from './ColoquioTeoriaComputacion.json';

export const SUBJECTS = [
  {
    id: 'teoria-computacion',
    title: 'Teoría de la Computación',
    subtitle: 'Coloquio: Lenguajes, Lenguajes Regulares y Gramáticas',
    badge: 'Coloquio',
    icon: '⚡',
    description: 'Estudio sistemático de alfabetos, cadenas, propiedades de lenguajes, expresiones regulares, derivaciones y jerarquía de Chomsky.',
    data: teoriaComputacionData
  }
];

export function getSubjectById(id) {
  return SUBJECTS.find(s => s.id === id) || null;
}
