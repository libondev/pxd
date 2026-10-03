import componentList from './components.json'
import composableList from './composables.json'

const componentMenus = Object.entries(
  componentList.reduce<Record<string, { label: string; path: string }[]>>(
    (acc, { name, camelized, category }) => {
      acc[category] = acc[category] || []
      acc[category].push({
        label: camelized,
        path: `/components/${name}`,
      })

      return acc
    },
    {},
  ),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([group, children]) => ({
    group,
    children,
  }))

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
  ...componentMenus,
  {
    group: 'Composables',
    children: composableMenus,
  },
]
