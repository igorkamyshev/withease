<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import prettyBytes from 'pretty-bytes';

ChartJS.register(Title, Tooltip, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  sizes: {
    type: Array,
    required: true,
  },
});
const chartData = computed(() => {
  const sortedSizes = [...props.sizes]
  sortedSizes.sort((a, b) => a.size - b.size);

  return {
    labels: sortedSizes.map((item) => item.name),
    datasets: [
      {
        data: sortedSizes.map((item) => item.size),
        backgroundColor: '#3451b2',
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) =>
          typeof value === 'number' ? prettyBytes(value) : value,
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (item) => prettyBytes(item.parsed.y),
        title: ([item]) => item?.label,
      },
    },
  },
};
</script>

<template>
  <Bar id="size-chart" :options="chartOptions" :data="chartData" />
</template>
