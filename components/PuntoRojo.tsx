interface PuntoRojoProps {
  visible: boolean
  size?: number
  offsetTop?: number
  offsetRight?: number
}

export function PuntoRojo({ visible, size = 8, offsetTop = -2, offsetRight = -2 }: PuntoRojoProps) {
  if (!visible) return null
  return (
    <span style={{
      position: 'absolute',
      top: offsetTop,
      right: offsetRight,
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#EF4444',
      border: '2px solid #fff',
      display: 'block',
      zIndex: 10,
      animation: 'pulse-red 2s infinite',
    }} />
  )
}