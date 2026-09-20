import type { Conformation } from '@/types'

/**
 * Ramachandran 构象区域的共用定义。
 * 图表底色区间、落点颜色、数据表标签与 CSV 下载内容统一从这里取值，
 * 新增/调整区域时只需改动这一份。
 */

export interface BackgroundZone {
  phi: [number, number]
  psi: [number, number]
}

export interface RegionDefinition {
  key: string // 数据与下载文件里使用的规范键名
  label: string // 界面展示的中文名称
  color: string // Ramachandran 图落点颜色
  tagType: 'success' | 'danger' | 'warning' | 'info' // 数据表 el-tag 样式
  backgroundZone?: BackgroundZone // 图表底色区间（二面角范围）
}

export const REGION_DEFINITIONS: readonly RegionDefinition[] = [
  {
    key: 'alpha-helix',
    label: 'α-螺旋',
    color: '#4ecdc4',
    tagType: 'success',
    backgroundZone: { phi: [-160, -90], psi: [-10, 60] },
  },
  {
    key: 'beta-sheet',
    label: 'β-折叠',
    color: '#ff6b6b',
    tagType: 'danger',
    backgroundZone: { phi: [45, 165], psi: [110, 180] },
  },
  { key: 'left-helix', label: '左手螺旋', color: '#45b7d1', tagType: 'warning' },
  { key: 'disallowed', label: '禁阻区', color: '#ddd', tagType: 'info' },
]

/** 区域取值缺失时的统一默认（原先散落在各组件，收拢为一份） */
export const REGION_FALLBACKS = {
  color: '#999',
  tagType: 'info',
} as const

const REGION_BY_KEY = new Map(REGION_DEFINITIONS.map(d => [d.key, d]))

export function getRegion(key: string): RegionDefinition | undefined {
  return REGION_BY_KEY.get(key)
}

export function regionColor(key: string): string {
  return getRegion(key)?.color ?? REGION_FALLBACKS.color
}

export function regionLabel(key: string): string {
  return getRegion(key)?.label ?? key
}

export function regionTagType(key: string): RegionDefinition['tagType'] {
  return getRegion(key)?.tagType ?? REGION_FALLBACKS.tagType
}

/* ---------- 二面角空间 → 画布坐标 ---------- */

export const DIHEDRAL_MIN = -180
export const DIHEDRAL_MAX = 180
/** 角度取值缺失时的统一默认 */
export const DEFAULT_DIHEDRAL = 0

/**
 * 边界校验：缺失/非有限值退回统一默认；
 * 越界值（含负角方向）截断到 [-180, 180]，界内取值（含 ±180 临界值）原样通过。
 */
export function normalizeDihedral(value: number | null | undefined): number {
  const v = typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_DIHEDRAL
  return Math.min(DIHEDRAL_MAX, Math.max(DIHEDRAL_MIN, v))
}

/** 校验后的角度线性映射到 [0, 1] */
export function dihedralFraction(value: number | null | undefined): number {
  return (normalizeDihedral(value) - DIHEDRAL_MIN) / (DIHEDRAL_MAX - DIHEDRAL_MIN)
}

export interface CanvasPoint {
  x: number
  y: number
}

/** φ → 画布 x（向右），ψ → 画布 y（向上，画布坐标需翻转） */
export function dihedralToCanvas(
  phi: number | null | undefined,
  psi: number | null | undefined,
  width: number,
  height: number,
): CanvasPoint {
  return {
    x: dihedralFraction(phi) * width,
    y: height - dihedralFraction(psi) * height,
  }
}

export interface CanvasRect {
  x: number
  y: number
  width: number
  height: number
}

/** 底色区间（二面角范围）→ 画布矩形 */
export function backgroundZoneRect(zone: BackgroundZone, width: number, height: number): CanvasRect {
  const span = DIHEDRAL_MAX - DIHEDRAL_MIN
  const phiLo = normalizeDihedral(zone.phi[0])
  const phiHi = normalizeDihedral(zone.phi[1])
  const psiLo = normalizeDihedral(zone.psi[0])
  const psiHi = normalizeDihedral(zone.psi[1])
  return {
    x: ((phiLo - DIHEDRAL_MIN) / span) * width,
    y: ((DIHEDRAL_MAX - psiHi) / span) * height,
    width: ((phiHi - phiLo) / span) * width,
    height: ((psiHi - psiLo) / span) * height,
  }
}

/** 底色区间填充色：落点颜色加统一透明度 */
export const ZONE_ALPHA = 0.08

export function withAlpha(hexColor: string, alpha: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/* ---------- CSV 下载 ---------- */

export const CSV_HEADER = 'id,phi,psi,energy,region,cluster'

/** 下载内容里的区域取值：统一使用共用定义里的规范键名 */
export function regionCsvValue(key: string): string {
  return getRegion(key)?.key ?? key
}

export function conformationsToCSV(confs: Conformation[]): string {
  const rows = confs
    .map(c => `${c.id},${c.phi},${c.psi},${c.energy},${regionCsvValue(c.region)},${c.cluster}`)
    .join('\n')
  return CSV_HEADER + '\n' + rows
}
