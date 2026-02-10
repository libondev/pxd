interface Page {
  label: string
  href: string
}

export interface PaginationProps {
  prev?: Page
  next?: Page
}
