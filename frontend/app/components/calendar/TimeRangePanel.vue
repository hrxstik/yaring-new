<template>
  <div class="time-range">
    <p class="time-range__label">Время</p>
    <div class="time-range__grid">
      <button
        v-for="slot in slots"
        :key="slot"
        type="button"
        class="time-range__slot"
        :class="slotClasses(slot)"
        :disabled="isBlocked(slot)"
        @click="onSlotClick(slot)"
      >
        {{ slot }}
      </button>
    </div>
    <p v-if="startTime && endTime" class="time-range__summary">
      {{ formatTimeRange(startTime, endTime) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { HOURLY_SLOTS, formatTimeRange } from '~/utils/calendar';

const props = defineProps<{
  startTime?: string;
  endTime?: string;
  blockedSlots?: { startTime: string; endTime: string }[];
}>();

const emit = defineEmits<{ change: [start?: string, end?: string] }>();

const slots = HOURLY_SLOTS;

function slotClasses(slot: string) {
  const start = props.startTime;
  const end = props.endTime;
  const isStart = slot === start;
  const isEnd = slot === end;
  const inRange =
    start &&
    end &&
    slot >= start &&
    slot <= end &&
    !isStart &&
    !isEnd;

  return {
    'time-range__slot--start': isStart,
    'time-range__slot--end': isEnd,
    'time-range__slot--mid': inRange,
  };
}

function isBlocked(slot: string) {
  if (!props.blockedSlots?.length) return false;
  return props.blockedSlots.some(
    (b) => slot >= b.startTime && slot < b.endTime,
  );
}

function onSlotClick(slot: string) {
  if (isBlocked(slot)) return;

  if (!props.startTime || (props.startTime && props.endTime)) {
    emit('change', slot, undefined);
    return;
  }

  if (slot <= props.startTime) {
    emit('change', slot, props.startTime);
    return;
  }

  const hasBlock = props.blockedSlots?.some(
    (b) =>
      b.startTime > props.startTime! &&
      b.startTime < slot,
  );
  if (hasBlock) {
    emit('change', slot, undefined);
    return;
  }

  emit('change', props.startTime, slot);
}
</script>

<style scoped lang="scss">
.time-range {
  &__label {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin-bottom: $space-3;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $space-2;

    @include sm {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  &__slot {
    padding: $space-2;
    border: 1px solid var(--color-border);
    border-radius: $radius-sm;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition;

    &:hover:not(:disabled) {
      border-color: var(--color-primary);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &--start,
    &--end {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      border-color: var(--color-primary);
    }

    &--mid {
      background: var(--color-surface-elevated);
      border-color: var(--color-primary);
    }
  }

  &__summary {
    margin-top: $space-4;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }
}
</style>
