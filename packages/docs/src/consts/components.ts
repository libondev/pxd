import componentList from './components.json'

const componentMenus = componentList.map(({ name, camelized }) => {
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
        label: 'Styled',
        path: '/guide/styled',
      },
      {
        label: 'Icon',
        path: '/guide/icon',
      },
      {
        label: 'Components',
        path: '/guide/components',
      },
      {
        label: 'Icons Overview',
        path: '/guide/icons-overview',
      },
      {
        label: 'FAQ',
        path: '/guide/faq',
      },
    ],
  },
  {
    group: 'Components',
    children: componentMenus,
  },
]
