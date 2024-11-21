<script setup lang="ts">
const defaultCode = `<PButton size="small">Button</PButton>
<PButton>Button</PButton>
<PButton size="large">Button</PButton>`

const variantCode = `<PButton>Button</PButton>
<PButton variant="secondary">Button</PButton>
<PButton variant="danger">Button</PButton>
<PButton variant="warning">Button</PButton>
<PButton variant="outline">Button</PButton>
<PButton variant="ghost">Button</PButton>
<PButton variant="underline">Button</PButton>`
</script>

<template>
  <Section
    title="Button"
    description="Trigger an action or event, such as submitting a form or displaying a dialog."
  />

  <Section title="Sizes">
    <Preview slot-class="flex items-center gap-4" :code="defaultCode">
      <div class="flex items-center gap-4">
        <PButton size="small">
          Button
        </PButton>
        <PButton>
          Button
        </PButton>
        <PButton size="large">
          Button
        </PButton>
      </div>
    </Preview>
  </Section>

  <Section title="Types">
    <Preview :code="variantCode" slot-class="flex items-center gap-4">
      <PButton>Button</PButton>
      <PButton variant="secondary">
        Button
      </PButton>
      <PButton variant="danger">
        Button
      </PButton>
      <PButton variant="warning">
        Button
      </PButton>
      <PButton variant="outline">
        Button
      </PButton>
      <PButton variant="ghost">
        Button
      </PButton>
      <PButton variant="underline">
        Button
      </PButton>
    </Preview>
  </Section>
</template>
