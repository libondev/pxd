# 问题记录

这里记录实现过程中遇到的问题与解决方法。这些问题只在与本项目相同的实现方案下出现，不代表其他方案同样存在，仅供参考。

- 编译到 Vue@2.7 时，`withDefaults` 的默认值只能是对象字面量，不能传入对象引用，所以这部分配置只能重新写一遍：

  ```ts
  // don't work
  const props = withDefaults(defineProps<Props>(), defaultConfig)
  // don't work
  const props = withDefaults(defineProps<Props>(), { ...defaultConfig })

  // working
  const props = withDefaults(defineProps<Props>(), { sm: 'md' })
  ```

- 同一工作区安装多个不同版本的 vue 会出现各种奇怪问题：开发时 `provide/inject` 正常，打包运行后 `inject` 取不到值。因此验证 Vue2 时请单独新建项目。

- 由于 Vue2 的事件透传机制与 Vue3 不同（Vue3 不再区分原生事件与自定义事件），像 `Button` 这类带用户交互的 `click` 事件需要显式 emit 声明并向上传递：

  ```html
  <template>
    <button @click="handleClick">Click me</button>
  </template>

  <script setup>
    const emits = defineEmits(['click'])

    function handleClick(ev) {
      emits('click', ev)
    }
  </script>
  ```

- 同理，Vue2 中 `v-bind` 的行为也有所不同，部分属性无法正常传递或覆盖。遇到允许用户覆盖的属性时，先合并再整体传入：

  ```js
  function getButtonProps() {
    return {
      shape: 'rounded',
      ...props.buttonProps,
    }
  }
  ```

  使用时整个传入

  ```html
  <button v-bind="getButtonProps()" />
  ```

- Vue2 中如果以小驼峰（`optionClick`）emit，父组件用短横线（`@option-click`）监听时不会触发；反过来才能正常监听。为了兼容 Vue2，统一使用短横线形式（Vue2 生态也普遍如此）。
