<template>
  <div class="date-range-panel">
    <CalendarPanel
      :mode="mode"
      :range-start="start"
      :range-end="end"
      :selected-date="mode === 'single' ? start : undefined"
      :min-date="minDate"
      :blocked-dates="blockedDates"
      :month-offset="0"
      @pick="handlePick"
    />
    <CalendarPanel
      v-if="mode === 'range'"
      :mode="mode"
      :range-start="start"
      :range-end="end"
      :min-date="minDate"
      :blocked-dates="blockedDates"
      :month-offset="1"
      @pick="handlePick"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    initialStart?: string;
    initialEnd?: string;
    minDate?: string;
    blockedDates?: string[];
    mode?: 'single' | 'range';
  }>(),
  { mode: 'range' },
);

const emit = defineEmits<{ change: [start?: string, end?: string] }>();

const start = ref(props.initialStart);
const end = ref(props.initialEnd);

watch(
  () => [props.initialStart, props.initialEnd],
  ([s, e]) => {
    start.value = s;
    end.value = e;
  },
);

watch([start, end], () => emit('change', start.value, end.value));

function handlePick(value: string) {
  if (props.mode === 'single') {
    start.value = value;
    end.value = value;
    return;
  }

  if (!start.value || (start.value && end.value)) {
    start.value = value;
    end.value = undefined;
    return;
  }
  if (value < start.value) {
    end.value = start.value;
    start.value = value;
    return;
  }
  end.value = value;
}
</script>

<style scoped lang="scss">
.date-range-panel {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}
</style>
