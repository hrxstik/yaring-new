<template>
  <div class="calendar-month">
    <div class="calendar-month__weekdays">
      <span v-for="day in CALENDAR_WEEKDAYS" :key="day">{{ day }}</span>
    </div>
    <div class="calendar-month__grid">
      <span v-for="n in firstDayOffset" :key="`e-${n}`" />
      <button
        v-for="day in daysInMonth"
        :key="day"
        type="button"
        class="calendar-month__day"
        :class="dayClasses(day)"
        :disabled="isDisabled(day)"
        @click="onDayClick(day)"
      >
        <span class="calendar-month__day-inner">{{ day }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CALENDAR_WEEKDAYS,
  getDaysInMonth,
  getFirstDayOfWeek,
  toIsoDate,
  localTodayIso,
} from '~/utils/calendar';

const props = defineProps<{
  year: number;
  month: number;
  mode: 'single' | 'range';
  rangeStart?: string;
  rangeEnd?: string;
  selectedDate?: string;
  minDate?: string;
  blockedDates?: string[];
}>();

const emit = defineEmits<{ pick: [iso: string] }>();

const today = localTodayIso();
const daysInMonth = computed(() => getDaysInMonth(props.year, props.month));
const firstDayOffset = computed(() => getFirstDayOfWeek(props.year, props.month));

function isoForDay(day: number) {
  return toIsoDate(props.year, props.month, day);
}

function inRange(iso: string) {
  if (!props.rangeStart || !props.rangeEnd) return false;
  return iso >= props.rangeStart && iso <= props.rangeEnd;
}

function dayClasses(day: number) {
  const iso = isoForDay(day);
  const isStart = props.rangeStart === iso;
  const isEnd = props.rangeEnd === iso;
  const isMid = inRange(iso) && !isStart && !isEnd;
  const isSelected = props.mode === 'single' && props.selectedDate === iso;
  const isBlocked = props.blockedDates?.includes(iso);

  return {
    'calendar-month__day--start': isStart,
    'calendar-month__day--end': isEnd,
    'calendar-month__day--mid': isMid,
    'calendar-month__day--selected': isSelected,
    'calendar-month__day--blocked': isBlocked,
    'calendar-month__day--today': iso === today,
  };
}

function isDisabled(day: number) {
  const iso = isoForDay(day);
  if (props.minDate && iso < props.minDate) return true;
  return props.blockedDates?.includes(iso) ?? false;
}

function onDayClick(day: number) {
  if (isDisabled(day)) return;
  emit('pick', isoForDay(day));
}
</script>

<style scoped lang="scss">
.calendar-month {
  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: $space-2;

    span {
      text-align: center;
      font-size: $font-size-xs;
      font-weight: 700;
      color: var(--color-text-muted);
      padding: $space-1 0;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px 0;
  }

  &__day {
    position: relative;
    height: 36px;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.35;
    }

    &--mid::before,
    &--start::before,
    &--end::before {
      content: '';
      position: absolute;
      top: 0;
      height: 36px;
      background: var(--color-primary-tint);
    }

    &--mid::before {
      left: 0;
      right: 0;
    }

    &--start::before {
      left: 50%;
      right: 0;
    }

    &--end::before {
      left: 0;
      right: 50%;
    }
  }

  &__day-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: 0 auto;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    color: var(--color-text);
    transition: background $transition;
  }

  &__day:hover:not(:disabled) &__day-inner {
    background: var(--color-surface-elevated);
  }

  &__day--today &__day-inner {
    box-shadow: inset 0 0 0 1px var(--color-primary);
    color: var(--color-primary);
  }

  &__day--start &__day-inner,
  &__day--end &__day-inner,
  &__day--selected &__day-inner {
    background: var(--color-primary);
    color: var(--color-primary-contrast);
    box-shadow: none;
  }
}
</style>
