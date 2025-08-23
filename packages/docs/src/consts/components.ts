import components from './components.json'

const componentsMenus = components.map(({ name, camelized }) => {
  return {
    label: camelized,
    path: `/components/${name}`,
  }
})

export const asideMenus = [
  {
    group: 'Guide',
    children: [
      {
        label: 'Introduction',
        path: '/guide/introduction',
      },
      {
        label: 'Installation',
        path: '/guide/installation',
      },
      {
        label: 'Icons',
        path: '/guide/icons',
      },
      {
        label: 'FAQ',
        path: '/guide/faq',
      },
    ],
  },
  {
    group: 'Components',
    children: [
      {
        label: 'Overview',
        path: '/components',
      },
      ...componentsMenus,
    ],
  },
]
