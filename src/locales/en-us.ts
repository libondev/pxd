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
  interaction: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    skip: 'Skip',
    submit: 'Submit',
  },
  questionnaire: {
    question: 'Q',
    answer: 'A',
  },
  results: {
    searchText: 'No results found for',
    noData: 'No data available',
  },
  pagination: {
    perPage: '/page',
    prev: 'Previous page',
    next: 'Next page',
  },
  reasoning: {
    thinking: 'Thinking...',
    thought: 'Thought',
  },
}

export type Locale = typeof enUS
export default enUS
