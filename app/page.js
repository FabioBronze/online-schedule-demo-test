import About from './about/page'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <About />
    </main>
  )
}
