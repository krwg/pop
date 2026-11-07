import frame01 from '@/assets/about/frames/frame-01.jpg'
import frame02 from '@/assets/about/frames/frame-02.jpg'
import frame03 from '@/assets/about/frames/frame-03.jpg'
import frame04 from '@/assets/about/frames/frame-04.jpg'
import frame05 from '@/assets/about/frames/frame-05.jpg'
import frame06 from '@/assets/about/frames/frame-06.jpg'
import frame07 from '@/assets/about/frames/frame-07.jpg'
import frame08 from '@/assets/about/frames/frame-08.jpg'
import styles from './AboutLightBg.module.css'

const FRAMES = [
  frame01,
  frame02,
  frame03,
  frame04,
  frame05,
  frame06,
  frame07,
  frame08,
] as const

/** Crossfade light cycle — no pan/slide of the plate. */
export function AboutLightBg() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={styles.stack}>
        {FRAMES.map((src, index) => (
          <img
            key={src}
            className={styles.frame}
            src={src}
            alt=""
            width={1920}
            height={1080}
            decoding={index === 0 ? 'sync' : 'async'}
            fetchPriority={index === 0 ? 'high' : 'low'}
            style={{ animationDelay: `${index * 10}s` }}
          />
        ))}
      </div>
      <div className={styles.veil} />
    </div>
  )
}
