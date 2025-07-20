import components from './components.json'

const componentsMenus = components.map(({ name, camelized }) => {
  return {
    label: camelized,
    path: `/components/${name}`,
  }
})

export const asideMenus = [
  {
    label: 'Guide',
    children: [
      {
        label: 'Introduction',
        path: '/guide',
      },
      {
        label: 'Installation',
        path: '/guide/installation',
      },
    ],
  },
  {
    label: 'Components',
    children: [
      {
        label: 'Overview',
        path: '/components',
      },
      ...componentsMenus,
    ],
  },
]
