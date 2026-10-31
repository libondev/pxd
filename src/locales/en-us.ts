const enUS = {
  date: {
    now: 'Now',
    today: 'Today',
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  timeAgo: {
    now: 'just now',
    invalid: 'Invalid date',
    past: '{value} {unit} ago',
    future: 'in {value} {unit}',
    unit: {
      minute: { one: 'minute', other: 'minutes' },
      hour: { one: 'hour', other: 'hours' },
      day: { one: 'day', other: 'days' },
      month: { one: 'month', other: 'months' },
      year: { one: 'year', other: 'years' },
    },
  },
  compare: {
    less: 'Less',
    more: 'More',
    next: 'Next',
    prev: 'Previous',
  },
  interaction: {
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    skip: 'Skip',
    submit: 'Submit',
  },
  questionnaire: {
    question: 'Q',
    answer: 'A',
    skipAll: 'Skip all questions',
    prev: 'Previous question',
    next: 'Next question',
    expand: 'Expand',
    collapse: 'Collapse',
  },
  tour: {
    next: 'Next',
    prev: 'Previous',
    done: 'Done',
    skip: 'Skip',
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
  toolCall: {
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    error: 'Error',
    input: 'Input',
    output: 'Output',
  },
  approval: {
    title: 'Run this command?',
    approve: 'Run',
    reject: 'Skip',
    remember: 'Always allow',
    reason: 'Reason (optional)',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    dismissed: 'Skipped',
  },
  feedback: {
    thumbUp: 'Thumb up',
    thumbDown: 'Thumb down',
    close: 'Dismiss',
  },
  codeBlock: {
    expand: 'Show more',
    collapse: 'Show less',
  },
}

export type Locale = typeof enUS
export default enUS
