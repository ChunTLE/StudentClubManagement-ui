<template>
  <div class="pie-chart-container">
    <el-card class="chart-card">
      <div v-if="showBackBtn" style="text-align:right;margin-bottom:8px;">
        <el-button size="small" @click="backToMainPie">返回</el-button>
      </div>
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../config/http'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let clubData: any[] = []
const showBackBtn = ref(false)

async function renderClubMemberChart() {
  const res = await http.get('/clubs/member-department-count')
  clubData = res.data || []
  const pieData = clubData.map((item: any) => ({ name: item.name, value: item.value }))
  await nextTick()
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
  }
  if (chartInstance) {
    chartInstance.setOption(getPieOption('各社团人数占比', pieData, '社团人数'))
    chartInstance.off('click')
    chartInstance.on('click', handlePieClick)
    showBackBtn.value = false
  }
}

function getPieOption(title: string, data: any[], seriesName: string) {
  return {
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: seriesName,
      type: 'pie',
      radius: '60%',
      data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}: {c}人 ({d}%)'
      }
    }]
  }
}

function handlePieClick(params: any) {
  // 查找被点击的社团
  const club = clubData.find((c: any) => c.name === params.name)
  if (club && club.departments && club.departments.length > 0) {
    // 显示部门分布
    chartInstance?.setOption(getPieOption(`${club.name} 各部门人数占比`, club.departments, '部门人数'))
    showBackBtn.value = true
    // 点击子饼图空白处不再返回主饼图，改为用按钮返回
    chartInstance?.off('click')
  }
}

function backToMainPie() {
  if (chartInstance) {
    chartInstance.setOption(getPieOption('各社团人数占比', clubData.map((item: any) => ({ name: item.name, value: item.value })), '社团人数'))
    chartInstance.off('click')
    chartInstance.on('click', handlePieClick)
    showBackBtn.value = false
  }
}

onMounted(() => {
  renderClubMemberChart()
})
</script>

<style scoped>
.pie-chart-container {
  max-width: 700px;
  margin: 40px auto;
}
.chart-card {
  width: 100%;
  padding: 24px;
}
</style> 