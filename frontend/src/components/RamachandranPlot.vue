<template>
  <div class="panel">
    <h3>📊 Ramachandran图 (φ-ψ 二面角空间)</h3>
    <canvas ref="cvs" width="500" height="500" class="plot-canvas"></canvas>
    <div class="legend">
      <template v-for="region in regions" :key="region.key">
        <span class="dot" :style="{ background: region.color }"></span> {{ region.label }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { useProteinStore } from "../store/protein"
import {
  REGION_DEFINITIONS, ZONE_ALPHA, backgroundZoneRect, dihedralFraction, dihedralToCanvas,
  regionColor, withAlpha,
} from "@/constants/ramachandran"
const store = useProteinStore()
const cvs = ref<HTMLCanvasElement>()
const regions = REGION_DEFINITIONS

function draw() {
  const c = cvs.value!; const ctx = c.getContext("2d")!; const W=c.width,H=c.height
  ctx.clearRect(0,0,W,H)
  ctx.strokeStyle="#e8e8e8"; ctx.lineWidth=1
  for(let a=-180;a<=180;a+=30){
    const f=dihedralFraction(a)
    let x=f*W; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke()
    let y=f*H; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke()
  }
  for(const region of regions){
    const z=region.backgroundZone; if(!z) continue
    const rect=backgroundZoneRect(z,W,H)
    ctx.fillStyle=withAlpha(region.color,ZONE_ALPHA)
    ctx.fillRect(rect.x,rect.y,rect.width,rect.height)
  }
  ctx.strokeStyle="#999"; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke()
  ctx.fillStyle="#666"; ctx.font="12px sans-serif"
  ctx.fillText("φ →",W-30,H/2-6); ctx.fillText("ψ ↑",W/2+6,16)
  const confs = (store.result?.conformations||[]).filter(c=>store.selectedCluster==="all"||c.cluster===store.selectedCluster)
  const es = confs.map(c=>c.energy); const eMin=Math.min(...es),eMax=Math.max(...es)
  for(const cf of confs){
    const {x,y}=dihedralToCanvas(cf.phi,cf.psi,W,H)
    const t = (cf.energy-eMin)/(eMax-eMin||1), r = 3 + t*3
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2)
    ctx.fillStyle=regionColor(cf.region); ctx.fill()
    ctx.strokeStyle="rgba(0,0,0,.1)"; ctx.stroke()
  }
  if(store.selectedConformation){
    const sc=store.selectedConformation
    const {x,y}=dihedralToCanvas(sc.phi,sc.psi,W,H)
    ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2)
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
.legend .dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:4px;vertical-align:middle}
</style>
