/**
 * 构象落点（Ramachandran 区域）的唯一共用定义：
 * 图表底色区间、落点颜色、图例/筛选/数据表标签、CSV 下载均从此处取值。
 * 区域分类本身以后端 RAMACHANDRAN_REGIONS 为准，这里只负责前端展示口径。
 */

export type RegionId = 'alpha-helix' | 'beta-sheet' | 'left-helix' | 'disallowed'
export type TagType = 'success' | 'danger' | 'warning' | 'info'

/** 二面角合法区间（度），与后端采样范围一致 */
export const ANGLE_MIN = -180
export const ANGLE_MAX = 180
/** 角度取值缺失时的统一默认角（落在画布中心） */
export const DEFAULT_ANGLE = 0
/** 区域取值缺失或无法识别时的统一默认区域 */
export const DEFAULT_REGION_ID: RegionId = 'disallowed'

/** 图表底色区间（二面角空间，闭区间，单位：度）；仅用于绘图底色，不参与分类 */
export interface ShadeZone {
  phi: [number, number]
  psi: [number, number]
}

export interface RegionDef {
  id: RegionId
  /** 中文名称（图例、筛选按钮、数据表标签共用） */
  label: string
  /** 落点与图例颜色 */
  color: string
  /** 数据表 el-tag 的类型 */
  tagType: TagType
  /** 图表底色区间；null 表示不绘制底色 */
  shade: ShadeZone | null
}

/** 展示顺序（图例、筛选按钮） */
export const REGION_ORDER: RegionId[] = ['alpha-helix', 'beta-sheet', 'left-helix', 'disallowed']

export const REGIONS: Record<RegionId, RegionDef> = {
  'alpha-helix': {
    id: 'alpha-helix',
    label: 'α-螺旋',
    color: '#4ecdc4',
    tagType: 'success',
    shade: { phi: [-160, -90], psi: [-10, 60] },
  },
  'beta-sheet': {
    id: 'beta-sheet',
    label: 'β-折叠',
    color: '#ff6b6b',
    tagType: 'danger',
    shade: { phi: [45, 165], psi: [110, 180] },
  },
  'left-helix': {
    id: 'left-helix',
    label: '左手螺旋',
    color: '#45b7d1',
    tagType: 'warning',
    shade: null,
  },
  disallowed: {
    id: 'disallowed',
    label: '禁阻区',
    color: '#ddd',
    tagType: 'info',
    shade: null,
  },
}

/** 统一兜底：区域取值缺失或无法识别时退回默认区域，而不是各处各写一份兜底 */
export function resolveRegion(id: string | null | undefined): RegionDef {
  return (id != null && REGIONS[id as RegionId]) || REGIONS[DEFAULT_REGION_ID]
}

/**
 * 二面角边界校验：越界值裁剪到 [-180, 180]；
 * 取值缺失（null / undefined / NaN）时退回统一默认角。
 */
export function clampAngle(value: number | null | undefined): number {
  if (value === null || value === undefined || Number.isNaN(value)) return DEFAULT_ANGLE
  return Math.min(ANGLE_MAX, Math.max(ANGLE_MIN, value))
}

/** 二面角 φ -> 画布 x（左端 -180°，右端 180°） */
export function angleToCanvasX(phi: number | null | undefined, width: number): number {
  return ((clampAngle(phi) - ANGLE_MIN) / (ANGLE_MAX - ANGLE_MIN)) * width
}

/** 二面角 ψ -> 画布 y（上端 +180°，下端 -180°） */
export function angleToCanvasY(psi: number | null | undefined, height: number): number {
  return height - ((clampAngle(psi) - ANGLE_MIN) / (ANGLE_MAX - ANGLE_MIN)) * height
}

/** 由落点颜色派生图表底色（与既有视觉一致的 8% 不透明度） */
export function shadeColor(color: string): string {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return `rgba(${r},${g},${b},.08)`
}
