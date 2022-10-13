import { type App, defineComponent } from 'vue'

import { CIcon } from '../icon'

const CSpinner = defineComponent({
  name: 'CSpinner',
  props: CIcon.props,
  render () {
    return (
      <CIcon {...this.$props}>
        <svg viewBox='0 0 24 24'>
          <path
            fill='none'
            stroke='currentColor'
            stroke-dasharray='15'
            stroke-dashoffset='15'
            stroke-linecap='round'
            stroke-width='2'
            d='M12 3C16.9706 3 21 7.02944 21 12'
          >
            <animate
              fill='freeze'
              attributeName='stroke-dashoffset'
              dur='0.3s'
              values='15;0'
            />
            <animateTransform
              attributeName='transform'
              dur='1.5s'
              repeatCount='indefinite'
              type='rotate'
              values='0 12 12;360 12 12'
            />
          </path>
        </svg>
      </CIcon>
    )
  },
  install (app: App) {
    app.component(CSpinner.name, CSpinner)
  }
})

export { CSpinner, CSpinner as default }
