const enUS = {
  date: {
    now: 'Now',
    today: 'Today',
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  compare: {
    less: 'Less',
    more: 'More',
    next: 'Next',
    prev: 'Previous',
  },
  confirm: {
    cancel: 'Cancel',
    submit: 'Submit',
  },
  interactive: {
    q: 'Q',
    a: 'A',
  },
  results: {
    searchText: 'No results found for',
    noData: 'No data available',
  },
  pagination: {
    perPage: '/page',
  },
}

export type Locale = typeof enUS
export default enUS
