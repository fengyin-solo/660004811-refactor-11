<template>
  <div class="panel" style="margin-top:16px">
    <div class="table-header">
      <h3>📋 构象数据 (共 {{ confs.length }} 条)</h3>
      <el-button size="small" @click="exportCSV">导出 CSV</el-button>
    </div>
    <el-table :data="confs" stripe max-height="360" highlight-current-row @row-click="onRowClick" size="small">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="phi" label="φ (°)" width="100">
        <template #default="{ row }">{{ row.phi.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="psi" label="ψ (°)" width="100">
        <template #default="{ row }">{{ row.psi.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="energy" label="LJ能量 (kcal/mol)" width="150">
        <template #default="{ row }">{{ row.energy.toFixed(3) }}</template>
      </el-table-column>
      <el-table-column prop="region" label="构象区域" width="120">
        <template #default="{ row }">
          <el-tag :type="regionTagType(row.region)" size="small">{{ regionLabel(row.region) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cluster" label="聚类" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProteinStore } from '../store/protein'
import type { Conformation } from '../types'
import { conformationsToCSV, regionLabel, regionTagType } from '@/constants/ramachandran'

const store = useProteinStore()
const confs = computed(() => (store.result?.conformations || []).filter(c =>
  store.selectedCluster === 'all' || c.cluster === store.selectedCluster
))

function onRowClick(row: Conformation) { store.selectConformation(row) }
function exportCSV() {
  const blob = new Blob([conformationsToCSV(confs.value)], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'conformations.csv'; a.click()
}
</script>

<style scoped>
.panel { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.table-header h3 { color: #333; font-size: 15px; }
</style>