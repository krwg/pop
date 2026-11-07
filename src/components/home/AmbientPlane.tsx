import ambientPlane from '@/assets/ambient-plane.png'
import styles from './AmbientPlane.module.css'

type AmbientPlaneProps = {
  className?: string
}

export function AmbientPlane({ className }: AmbientPlaneProps) {
  const classes = [styles.plane, className].filter(Boolean).join(' ')

  return (
    <div className={classes} aria-hidden="true">
      <img
        className={styles.art}
        src={ambientPlane}
        alt=""
        width={1920}
        height={1080}
        decoding="async"
        fetchPriority="high"
      />
      <div className={styles.veil} />
    </div>
  )
}
