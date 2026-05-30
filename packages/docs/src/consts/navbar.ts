import componentList from './components.json'
import composableList from './composables.json'

const componentMenus = componentList.map(({ name, camelized }) => {
  return {
    label: camelized,
    path: `/components/${name}`,
  }
})

const composableMenus = composableList.map(({ name }) => {
  return {
    label: name,
    path: `/composables/${name}`,
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
        label: 'Installation Icon',
        path: '/guide/installation-icon',
      },
      {
        label: 'Components',
        path: '/guide/components',
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
    children: componentMenus,
  },
  {
    group: 'Composables',
    children: composableMenus,
  },
]
