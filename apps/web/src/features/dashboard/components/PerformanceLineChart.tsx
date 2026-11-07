type SeriesPoint = {
  label: string
  thisWeek: number
  lastWeek: number
}

type PerformanceLineChartProps = {
  series: SeriesPoint[]
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function PerformanceLineChart({ series }: PerformanceLineChartProps) {
  const width = 640
  const height = 220
  const pad = { top: 16, right: 12, bottom: 28, left: 36 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const max = Math.max(4, ...series.flatMap((s) => [s.thisWeek, s.lastWeek]))
  const ticks = 4
  const stepX = series.length > 1 ? innerW / (series.length - 1) : innerW

  const toPoints = (key: 'thisWeek' | 'lastWeek') =>
    series.map((s, i) => ({
      x: pad.left + i * stepX,
      y: pad.top + innerH - (s[key] / max) * innerH,
    }))

  const thisPts = toPoints('thisWeek')
  const lastPts = toPoints('lastWeek')
  const thisLine = smoothPath(thisPts)
  const lastLine = smoothPath(lastPts)
  const area =
    thisPts.length > 0
      ? `${thisLine} L ${thisPts[thisPts.length - 1].x} ${pad.top + innerH} L ${thisPts[0].x} ${pad.top + innerH} Z`
      : ''

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] w-full"
        role="img"
        aria-label="Appointments this week versus last week"
      >
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const y = pad.top + (innerH / ticks) * i
          const value = Math.round(max - (max / ticks) * i)
          return (
            <g key={i}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="#eef0f5"
                strokeWidth="1"
              />
              <text x={4} y={y + 4} fill="#9aa1b2" fontSize="10">
                {value}
              </text>
            </g>
          )
        })}
        <path d={area} fill="var(--color-primary)" fillOpacity="0.12" />
        <path d={lastLine} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
        <path d={thisLine} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
        {thisPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="var(--color-primary)" strokeWidth="2.5" />
        ))}
        {series.map((s, i) => (
          <text
            key={s.label}
            x={pad.left + i * stepX}
            y={height - 6}
            textAnchor="middle"
            fill="#9aa1b2"
            fontSize="10"
          >
            {s.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
