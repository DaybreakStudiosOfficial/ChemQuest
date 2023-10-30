import Head from 'next/head'
import NavBar from '../components/NavBar'
import styles from '../styles/Layout.module.css'

export default function Layout({ title, children }) {
    return (
        <div>
            <Head>
                <title>{title ? title + " | " : ""} ChemQuest</title>
                <link rel="icon" href="/logo.ico" />
            </Head>
            <NavBar />
            <div className={styles.main}>
                {children}
            </div>
        </div>
    )
}
