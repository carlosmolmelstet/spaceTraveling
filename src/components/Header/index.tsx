import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.header}>
      <Link href="/"> 
        <img className={styles.logo} src="/Logo.svg" alt="Logo"  />
      </Link>
    </div>
  )
}
