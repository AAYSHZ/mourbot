interface ShinyTextProps {
  text: string
  className?: string
}

export default function ShinyText({ text, className = '' }: ShinyTextProps) {
  return <span className={`shiny-text ${className}`}>{text}</span>
}
