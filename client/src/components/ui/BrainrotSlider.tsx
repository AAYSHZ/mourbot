interface BrainrotSliderProps {
  value: number
  onChange: (value: number) => void
}

function getLabel(value: number): { text: string; className: string } {
  if (value <= 30) return { text: '😌 Calm', className: 'calm' }
  if (value <= 60) return { text: '🗿 Mid', className: 'mid' }
  if (value <= 85) return { text: '🔥 Cooked', className: 'cooked' }
  return { text: '💀 Tweaking', className: 'tweaking' }
}

export default function BrainrotSlider({ value, onChange }: BrainrotSliderProps) {
  const label = getLabel(value)

  return (
    <div className="brainrot-control">
      <span className="brainrot-label">Brainrot</span>
      <input
        type="range"
        className="brainrot-slider"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={`brainrot-value ${label.className}`}>
        {label.text}
      </span>
    </div>
  )
}
