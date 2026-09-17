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
  interaction: {
    cancel: '取消',
    confirm: '确认',
    skip: '跳过',
    submit: '提交',
  },
  questionnaire: {
    question: '问',
    answer: '答',
    skipAll: '跳过全部问题',
    collapse: '收起',
    expand: '展开',
    prev: '上一题',
    next: '下一题',
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
  reasoning: {
    thinking: '正在思考...',
    thought: '思考',
  },
  toolCall: {
    pending: '等待中',
    running: '运行中',
    completed: '已完成',
    error: '错误',
    input: '输入',
    output: '输出',
  },
} satisfies Locale

export default zhCN
