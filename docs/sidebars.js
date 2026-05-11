/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    { type: 'doc', id: 'intro',         label: 'Introducción' },
    { type: 'doc', id: 'architecture',  label: 'Arquitectura (C4)' },
    { type: 'doc', id: 'backend',       label: 'Backend — Spring Boot' },
    { type: 'doc', id: 'frontend',      label: 'Frontend — React' },
    { type: 'doc', id: 'tasks/tarea-a', label: 'Tarea A — Historial del Marcador' },
    { type: 'doc', id: 'reflection',    label: 'Reflexión' },
  ],
};

module.exports = sidebars;