export interface DateTimePreset<T = Date> {
  label: string
  getDate: () => T
}
