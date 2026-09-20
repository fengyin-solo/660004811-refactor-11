<template>
  <div class="panel">
    <h3>📊 Ramachandran图 (φ-ψ 二面角空间)</h3>
    <canvas ref="cvs" width="500" height="500" class="plot-canvas"></canvas>
    <div class="legend">
      <span v-for="r in regionDefs" :key="r.id" class="legend-item">
        <span class="dot" :style="{ background: r.color }"></span>{{ r.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { useProteinStore } from "../store/protein"
import {
  REGION_ORDER,
  REGIONS,
  resolveRegion,
  angleToCanvasX,
  angleToCanvasY,
  shadeColor,
  type RegionDef,
} from "../shared/regions"

const store = useProteinStore()
const cvs = ref<HTMLCanvasElement>()
const regionDefs: RegionDef[] = REGION_ORDER.map((id) => REGIONS[id])

function draw() {
  const c = cvs.value!; const ctx = c.getContext("2d")!; const W=c.width,H=c.height
  ctx.clearRect(0,0,W,H)
  ctx.strokeStyle="#e8e8e8"; ctx.lineWidth=1
  for(let a=-180;a<=180;a+=30){
    let x=angleToCanvasX(a,W); ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke()
    let y=angleToCanvasY(a,H); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke()
  }
  for (const def of regionDefs) {
    if (!def.shade) continue
    const { phi, psi } = def.shade
    ctx.fillStyle = shadeColor(def.color)
    ctx.fillRect(
      angleToCanvasX(phi[0], W),
      angleToCanvasY(psi[1], H),
      angleToCanvasX(phi[1], W) - angleToCanvasX(phi[0], W),
      angleToCanvasY(psi[0], H) - angleToCanvasY(psi[1], H),
    )
  }
  ctx.strokeStyle="#999"; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke()
  ctx.fillStyle="#666"; ctx.font="12px sans-serif"
  ctx.fillText("φ →",W-30,H/2-6); ctx.fillText("ψ ↑",W/2+6,16)
  const confs = (store.result?.conformations||[]).filter(c=>store.selectedCluster==="all"||c.cluster===store.selectedCluster)
  const es = confs.map(c=>c.energy); const eMin=Math.min(...es),eMax=Math.max(...es)
  for(const cf of confs){
    const x = angleToCanvasX(cf.phi, W), y = angleToCanvasY(cf.psi, H)
    const t = (cf.energy-eMin)/(eMax-eMin||1), r = 3 + t*3
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2)
    ctx.fillStyle=resolveRegion(cf.region).color; ctx.fill()
    ctx.strokeStyle="rgba(0,0,0,.1)"; ctx.stroke()
  }
  if(store.selectedConformation){
    const sc=store.selectedConformation
    ctx.beginPath(); ctx.arc(angleToCanvasX(sc.phi,W), angleToCanvasY(sc.psi,H), 8, 0, Math.PI*2)
    ctx.strokeStyle="#333"; ctx.lineWidth=3; ctx.stroke()
  }
}
onMounted(draw)
watch(()=>[store.result,store.selectedConformation,store.selectedCluster],draw,{deep:true})
</script>

<style scoped>
.panel{background:#fff;border-radius:8px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.panel h3{margin-bottom:12px;color:#333}
.plot-canvas{display:block;margin:0 auto;border:1px solid #eee;border-radius:8px}
.legend{display:flex;gap:16px;justify-content:center;margin-top:12px;font-size:13px}
.legend-item{display:inline-flex;align-items:center}
.legend .dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:4px;vertical-align:middle}
</style>
