// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://zweer.github.io/utils',
  base: '/utils/',
  integrations: [
    starlight({
      title: '@zweer/utils',
      description: 'A collection of useful Node.js CLI utilities',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Zweer/utils' }],
      editLink: {
        baseUrl: 'https://github.com/Zweer/utils/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Packages',
          items: [
            { label: 'coverage-badge-readme', slug: 'packages/coverage-badge-readme' },
            { label: 'export-code', slug: 'packages/export-code' },
            { label: 'llms-txt', slug: 'packages/llms-txt' },
            { label: 'publish-dummy-package', slug: 'packages/publish-dummy-package' },
          ],
        },
      ],
    }),
  ],
});
