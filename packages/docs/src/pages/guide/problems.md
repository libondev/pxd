# 问题记录
这里记录了实现过程中遇到的一些问题及解决方法，这些问题仅出现在使用当前组件库相同实现方案中，不代表其他方案是否也存在，所以仅供参考

- 编译成 Vue@2.7 时，`withDefaults` 默认值只能使用对象字面量，也不能传入对象引用, 这个配置只能重新写一个对象

  ```ts
  // don't work
  const props = withDefaults(
    defineProps<Props>(),
    defaultConfig,
  )
  // don't work
  const props = withDefaults(
    defineProps<Props>(),
    { ...defaultConfig },
  )

  // working
  const props = withDefaults(
    defineProps<Props>(),
    { sm: 'md' },
  )
  ```

- 同一个工作区安装了多个不同版本的 vue 会出现各种奇怪的问题，比如开发时使用的 `provide/inject` 是正常的，但是打包运行以后，`inject` 会无法获取，所以 Vue2 还是单独新建项目进行测试

- 由于 Vue2 中事件透传的机制与 Vue3 不同（Vue3中不再区分原生事件和自定义事件），所以类似 `Button` 之类包含用户交互的 `click` 事件需要主动使用 emit 声明并向上传递事件
  ```html
  <template>
    <button @click="handleClick">
      Click me
    </button>
  </template>

  <script setup>
  const emits = defineEmits(['click'])

  function handleClick(ev) {
    emits('click', ev)
  }
  </script>
  ```

- 同样由于 Vue2 中 v-bind 的行为有所不同，所以可能有些属性不能正常传递和覆盖，如果在组件中遇到用户可以传入属性进行覆盖的就可以先合并再一次性传入：
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
  <Button v-bind="getButtonProps()" />
  ```
