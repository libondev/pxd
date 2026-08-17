import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { h } from 'vue'
import Calendar from '../../src/components/calendar/index.vue'
import { dayjs } from '../../src/utils/date'

const august15 = new Date(2024, 7, 15).getTime()
const august20 = new Date(2024, 7, 20).getTime()
const august20Info = { year: 2024, month: 8, date: 20 }

function findDateCell(wrapper: ReturnType<typeof mount>, date: number) {
  const cell = wrapper
    .findAll('[role="gridcell"]')
    .find((item) => item.text().trim() === String(date))

  expect(cell).toBeDefined()
  return cell!
}

function findTodayButton(wrapper: ReturnType<typeof mount>) {
  const button = wrapper.findAll('button').find((item) => item.text() === 'Today')

  expect(button).toBeDefined()
  return button!
}

describe('calendar', () => {
  it('renders a six-week grid and selects the provided model value', () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: august15,
      },
    })

    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(42)
    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(1)
    expect(wrapper.find('[aria-selected="true"]').text()).toBe('15')

    wrapper.unmount()
  })

  it('updates the uncontrolled selection and emits date information', async () => {
    const wrapper = mount(Calendar, {
      props: {
        defaultValue: august15,
      },
    })

    await findDateCell(wrapper, 20).trigger('click')

    expect(wrapper.find('[aria-selected="true"]').text()).toBe('20')
    expect(wrapper.emitted('change')).toEqual([[august20, august20Info]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[august20, august20Info]])

    wrapper.unmount()
  })

  it('does not select disabled dates', async () => {
    const isDateDisabled = (timestamp: number) => dayjs(timestamp).date() === 20
    const wrapper = mount(Calendar, {
      props: {
        modelValue: august15,
        isDateDisabled,
      },
    })

    const disabledCell = findDateCell(wrapper, 20)

    expect(disabledCell.attributes('disabled')).toBeDefined()
    expect(disabledCell.classes()).not.toContain('opacity-35')
    expect(disabledCell.find('span').classes()).toContain('opacity-35')

    await disabledCell.trigger('click')

    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('keeps the grid border opaque for dates outside the current month', () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: august15,
      },
    })

    const outsideMonthCell = findDateCell(wrapper, 31)

    expect(outsideMonthCell.classes()).not.toContain('opacity-60')
    expect(outsideMonthCell.find('span').classes()).toEqual(
      expect.arrayContaining(['text-foreground-secondary', 'opacity-60']),
    )

    wrapper.unmount()
  })

  it('emits panel changes when navigating months', async () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: august15,
      },
    })

    await wrapper.find('[aria-label="Next month"]').trigger('click')
    await wrapper.find('[aria-label="Previous month"]').trigger('click')

    expect(wrapper.emitted('panel-change')).toEqual([
      [{ year: 2024, month: 9 }],
      [{ year: 2024, month: 8 }],
    ])

    wrapper.unmount()
  })

  it('selects today and emits the current panel information', async () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: august15,
      },
    })

    await findTodayButton(wrapper).trigger('click')

    const emittedValue = wrapper.emitted('update:modelValue')?.[0]?.[0]
    const panelChanges = wrapper.emitted('panel-change')
    const latestPanel = panelChanges?.[panelChanges.length - 1]?.[0] as {
      year: number
      month: number
    }

    expect(dayjs(emittedValue as number).isSame(dayjs(), 'day')).toBe(true)
    expect(latestPanel).toEqual({ year: dayjs().year(), month: dayjs().month() + 1 })

    wrapper.unmount()
  })

  it('renders custom header and date content slots', () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: august15,
      },
      slots: {
        item: ({ date, isSelected }: { date: number; isSelected: boolean }) =>
          h('span', { class: 'custom-date', 'data-selected': isSelected }, String(date)),
        header: ({ year, month }: { year: number; month: number }) =>
          h('span', { class: 'custom-header' }, `${year}-${month}`),
      },
    })

    expect(wrapper.find('.custom-header').text()).toBe('2024-8')
    expect(wrapper.findAll('.custom-date')).toHaveLength(42)
    expect(wrapper.find('[aria-selected="true"] .custom-date').attributes('data-selected')).toBe(
      'true',
    )

    wrapper.unmount()
  })

  it('does not recalculate disabled dates for same-month selection changes', async () => {
    const isDateDisabled = vi.fn(() => false)
    const wrapper = mount(Calendar, {
      props: {
        defaultValue: august15,
        isDateDisabled,
      },
    })

    expect(isDateDisabled).toHaveBeenCalledTimes(42)

    await findDateCell(wrapper, 20).trigger('click')

    expect(isDateDisabled).toHaveBeenCalledTimes(42)

    wrapper.unmount()
  })

  it('does not recalculate disabled dates for controlled same-month updates', async () => {
    const isDateDisabled = vi.fn(() => false)
    const wrapper = mount(Calendar, {
      props: {
        modelValue: august15,
        isDateDisabled,
      },
    })

    expect(isDateDisabled).toHaveBeenCalledTimes(42)

    await wrapper.setProps({ modelValue: new Date(2024, 7, 20).getTime() })

    expect(isDateDisabled).toHaveBeenCalledTimes(42)
    expect(wrapper.emitted('panel-change')).toBeUndefined()

    wrapper.unmount()
  })

  it('renders compact mode and keeps date selection working', async () => {
    const wrapper = mount(Calendar, {
      props: {
        defaultValue: august15,
        compact: true,
      },
    })

    const cells = wrapper.findAll('[role="gridcell"]')
    const firstCellClasses = cells[0]!.classes()

    expect(cells).toHaveLength(42)
    expect(firstCellClasses).toEqual(expect.arrayContaining(['h-8', 'justify-self-center']))
    expect(firstCellClasses).not.toEqual(expect.arrayContaining(['border-r', 'min-h-14']))

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(45)

    expect(buttons.some((button) => button.text() === 'Today')).toBe(true)

    await findDateCell(wrapper, 20).trigger('click')

    expect(wrapper.find('[aria-selected="true"]').text()).toBe('20')
    expect(wrapper.emitted('change')).toEqual([[august20, august20Info]])

    wrapper.unmount()
  })
})
