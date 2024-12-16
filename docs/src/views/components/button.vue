<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon } from 'gdsi/vue'

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

  <Section title="Shapes">
    <Preview slot-class="flex items-center gap-6 flex-wrap" :code="variantCode">
      <PButton size="tiny" shape="normal">
        Button
      </PButton>
      <PButton size="small" shape="normal">
        Button
      </PButton>
      <PButton size="default" shape="normal">
        Button
      </PButton>
      <PButton size="large" shape="normal">
        Button
      </PButton>
      <PButton size="tiny" shape="square">
        Button
      </PButton>
      <PButton size="small" shape="square">
        Button
      </PButton>
      <PButton size="default" shape="square">
        Button
      </PButton>
      <PButton size="large" shape="square">
        Button
      </PButton>
      <PButton size="tiny" shape="rounded">
        Button
      </PButton>
      <PButton size="small" shape="rounded">
        Button
      </PButton>
      <PButton size="default" shape="rounded">
        Button
      </PButton>
      <PButton size="large" shape="rounded">
        Button
      </PButton>
      <PButton size="tiny" shape="circle">
        Button
      </PButton>
      <PButton size="small" shape="circle">
        Button
      </PButton>
      <PButton size="default" shape="circle">
        Button
      </PButton>
      <PButton size="large" shape="circle">
        Button
      </PButton>
    </Preview>
  </Section>

  <Section title="Prefix and suffix">
    <Preview slot-class="flex items-center gap-4" :code="variantCode">
      <PButton>
        <template #prefix>
          <ArrowLeftIcon />
        </template>
        Button
      </PButton>
      <PButton>
        Button
        <template #suffix>
          <ArrowRightIcon />
        </template>
      </PButton>
      <PButton>
        <template #prefix>
          <ArrowLeftIcon />
        </template>
        Button
        <template #suffix>
          <ArrowRightIcon />
        </template>
      </PButton>
    </Preview>
  </Section>
</template>
