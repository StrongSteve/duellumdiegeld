<script setup lang="ts">
import { computed } from 'vue'
import { CategoryLabels, type Category } from '@/types'

const props = defineProps<{
  questionText: string
  category: Category
  answerUnit?: string
  showUnit?: boolean
}>()

const categoryLabel = computed(() => CategoryLabels[props.category] || props.category)
</script>

<template>
  <div class="question-card card p-6 md:p-8 lg:p-10 animate-fade-in">
    <!-- Kategorie Badge -->
    <div class="flex justify-center mb-4">
      <span class="badge badge-primary text-sm md:text-base">
        {{ categoryLabel }}
      </span>
    </div>

    <!-- Frage -->
    <h2 class="question-display text-slate-100">
      {{ questionText }}
    </h2>

    <!-- Einheit (optional) -->
    <div v-if="showUnit && answerUnit" class="mt-4 text-center">
      <span class="text-slate-400 text-lg">
        Antwort in: <span class="text-primary-400 font-medium">{{ answerUnit }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  @apply max-w-4xl mx-auto;
}
</style>
