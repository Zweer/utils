import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@zweer/utils',
  description: 'A collection of useful Node.js CLI utilities',
  base: '/utils/',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Packages', link: '/packages/coverage-badge-readme' },
    ],

    sidebar: [
      {
        text: 'Packages',
        items: [
          { text: 'coverage-badge-readme', link: '/packages/coverage-badge-readme' },
          { text: 'export-code', link: '/packages/export-code' },
          { text: 'llms-txt', link: '/packages/llms-txt' },
          { text: 'publish-dummy-package', link: '/packages/publish-dummy-package' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Zweer/utils' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Zweer',
    },
  },
});
