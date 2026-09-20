<template>
  <div class="control-card">
    <el-form :model="form" inline>
      <el-form-item label="残基数">
        <el-input-number v-model="form.residues" :min="3" :max="50" />
      </el-form-item>
      <el-form-item label="构象数量">
        <el-input-number v-model="form.conformations" :min="100" :max="5000" :step="100" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emitSample" :loading="store.loading">🎲 生成构象采样</el-button>
      </el-form-item>
    </el-form>
    <div class="filters" v-if="store.result">
      <el-radio-group v-model="activeCluster" @change="onCluster">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button v-for="r in regionDefs" :key="r.id" :label="r.id">{{ r.label }}</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { useProteinStore } from "../store/protein"
import { REGION_ORDER, REGIONS } from "../shared/regions"
const emit = defineEmits<{ sample: [params: { residues: number; conformations: number }] }>()
const store = useProteinStore()
const form = reactive({ residues: 10, conformations: 1000 })
const activeCluster = ref("all")
const regionDefs = REGION_ORDER.map((id) => REGIONS[id])
function emitSample() { emit("sample", { ...form }) }
function onCluster(val: string) { store.filterByCluster(val) }
</script>

<style scoped>
.control-card { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.filters { margin-top: 12px; }
</style>
