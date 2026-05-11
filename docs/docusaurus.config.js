// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Panel Partido en Vivo',
  tagline: 'Documentación técnica — Spring Boot + React + WebSocket',
  favicon: 'img/favicon.ico',

  url: 'https://greciasaucedo.github.io',
  baseUrl: '/spring-boot-1/',

  organizationName: 'greciasaucedo',
  projectName: 'spring-boot-1',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      mermaid: {
        theme: { light: 'neutral', dark: 'forest' },
        options: {
          maxTextSize: 90000,
        },
      },
      navbar: {
        title: 'Panel Partido en Vivo',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentación',
          },
          {
            href: 'https://github.com/greciasaucedo/spring-boot-1',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentación',
            items: [
              { label: 'Introducción', to: '/' },
              { label: 'Arquitectura C4', to: '/architecture' },
            ],
          },
          {
            title: 'Código',
            items: [
              { label: 'Backend', to: '/backend' },
              { label: 'Frontend', to: '/frontend' },
            ],
          },
          {
            title: 'Más',
            items: [
              { label: 'GitHub', href: 'https://github.com/greciasaucedo/spring-boot-1' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Grecia Klarissa Saucedo Sandoval | A00839374. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java', 'bash', 'sql', 'properties'],
      },
    }),
};

module.exports = config;