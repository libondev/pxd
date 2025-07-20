# FAQ
Here will record some problems encountered in the process of use. If you have no clue after finding the problems, you can come here and have a look.

### Use camelCase style in Vue2 but the event doesn't take effect?

Because the events in vue2 distinguish between camelCase and kebab-case style, but the common style in vue2 is kebab-case style, please use the form of @kebab-case when the events do not take effect.

```html
<!-- Vue2 only -->

<!-- Bad (does't work) -->
<PActiveGraph @cellClick="handleCellClick" />

<!-- Good (it works) -->
<PActiveGraph @cell-click="handleCellClick" />
```
