import type { Locale } from './index.js'

const zhCN = {
  date: {
    now: '此刻',
    today: '今天',
    day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    month: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ],
  },
  compare: {
    less: '少',
    more: '多',
    next: '之后',
    prev: '之前',
  },
  confirm: {
    cancel: '取消',
    submit: '提交',
  },
  interactive: {
    q: '问',
    a: '答',
  },
  results: {
    searchText: '未找到结果：',
    noData: '暂无数据',
  },
  pagination: {
    perPage: '条/页',
    prev: '上一页',
    next: '下一页',
  },
} satisfies Locale

export default zhCN
