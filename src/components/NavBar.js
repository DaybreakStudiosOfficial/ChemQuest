import styles from '../styles/NavBar.module.css'
import { useRouter } from 'next/navigation'
import { auth, database } from '../components/configFirebase'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'

function NavButton({ text, location }) {
    const router = useRouter()
    return (
        <button
            className={styles.navButton}
            onClick={() => router.push((location))}>
            {text}
        </button>
    )
}

function Dashboard({ uid, router }) {
    return (
        <button className={ styles.navButton } onClick={() => {
            router.push({
                pathname: '/[userDashboard]',
                query: { userDashboard: uid }
            })
        }}>
        Dashboard
        </button>
    )
}

function verifyUser() {
    const router = useRouter()
    onAuthStateChanged(auth, (user) => {
        if (user) {
            return true
        } else {
            return false
        }
    })
}

const NavBar = () => {
    const router = useRouter()
    if (auth.currentUser) {
        return (
            <div className={styles.navBar}>
                <div>
                    <button
                        className={styles.logo}
                        onClick={() => router.push(('/'))}>
                        ChemQuest
                    </button>
                </div>
                <div>
                    <NavButton text='Play game' location='/game' />
                    <Dashboard uid={auth.currentUser.uid} router={ router } />
                </div>
            </div>
        )
    } else {
        return (
            <div className={styles.navBar}>
                <div>
                    <button
                        className={styles.logo}
                        onClick={() => router.push(('/'))}>
                        ChemQuest
                    </button>
                </div>
                <div>
                    <NavButton text='Log in' location='/login' />
                    <NavButton text='Sign up' location='/signup' />
                </div>
            </div>
        )
    }
}
export default NavBar