<template>
  <div class="calendar-panel">
    <div class="calendar-panel__nav">
      <button type="button" aria-label="Предыдущий месяц" @click="prevMonth">
        <ChevronLeft :size="16" />
      </button>
      <span class="calendar-panel__label">{{ monthLabel }}</span>
      <button type="button" aria-label="Следующий месяц" @click="nextMonth">
        <ChevronRight :size="16" />
      </button>
    </div>
    <CalendarMonth
      :year="viewYear"
      :month="viewMonth"
      :mode="mode"
      :range-start="rangeStart"
      :range-end="rangeEnd"
      :selected-date="selectedDate"
      :min-date="minDate"
      :blocked-dates="blockedDates"
      @pick="$emit('pick', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { CALENDAR_MONTHS } from '~/utils/calendar';

const props = defineProps<{
  mode: 'single' | 'range';
  rangeStart?: string;
  rangeEnd?: string;
  selectedDate?: string;
  minDate?: string;
  blockedDates?: string[];
  monthOffset?: number;
}>();

defineEmits<{ pick: [iso: string] }>();

const now = new Date();
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth());

watch(
  () => props.monthOffset,
  (offset) => {
    if (offset === undefined) return;
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    viewYear.value = d.getFullYear();
    viewMonth.value = d.getMonth();
  },
  { immediate: true },
);

const monthLabel = computed(
  () => `${CALENDAR_MONTHS[viewMonth.value]} ${viewYear.value}`,
);

function prevMonth() {
  if (viewMonth.value === 0) {
    viewYear.value -= 1;
    viewMonth.value = 11;
  } else {
    viewMonth.value -= 1;
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewYear.value += 1;
    viewMonth.value = 0;
  } else {
    viewMonth.value += 1;
  }
}
</script>

<style scoped lang="scss">
.calendar-panel {
  &__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-4;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-border);
      border-radius: $radius-full;
      background: var(--color-surface);
      color: var(--color-text);
      cursor: pointer;
      transition: border-color $transition;

      &:hover {
        border-color: var(--color-primary);
      }
    }
  }

  &__label {
    font-size: var(--font-base);
    font-weight: 700;
    color: var(--color-text);
  }
}
</style>
