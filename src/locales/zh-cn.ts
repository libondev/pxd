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
  timeAgo: {
    now: '刚刚',
    invalid: '无效时间',
    past: '{value}{unit}前',
    future: '{value}{unit}后',
    unit: {
      minute: { one: '分', other: '分' },
      hour: { one: '小时', other: '小时' },
      day: { one: '天', other: '天' },
      month: { one: '个月', other: '个月' },
      year: { one: '年', other: '年' },
    },
  },
  compare: {
    less: '少',
    more: '多',
    next: '之后',
    prev: '之前',
  },
  interaction: {
    cancel: '取消',
    close: '关闭',
    confirm: '确认',
    skip: '跳过',
    submit: '提交',
  },
  questionnaire: {
    question: '问',
    answer: '答',
    skipAll: '跳过全部问题',
    prev: '上一题',
    next: '下一题',
    expand: '展开',
    collapse: '收起',
  },
  tour: {
    next: '下一步',
    prev: '上一步',
    done: '完成',
    skip: '跳过',
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
  approval: {
    title: '执行这条命令?',
    approve: '运行',
    reject: '跳过',
    remember: '总是允许',
    reason: '原因(可选)',
    pending: '待确认',
    approved: '已允许',
    rejected: '已拒绝',
    dismissed: '已跳过',
  },
  todo: {
    title: '任务',
    inProgress: '进行中',
    pending: '待处理',
    completed: '已完成',
    canceled: '已取消',
  },
  feedback: {
    thumbUp: '点赞',
    thumbDown: '点踩',
    close: '关闭',
  },
  codeBlock: {
    expand: '展开全部',
    collapse: '收起',
  },
} satisfies Locale

export default zhCN
