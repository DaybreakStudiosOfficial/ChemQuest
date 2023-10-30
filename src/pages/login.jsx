import { useRouter } from 'next/router'
import { auth, database } from '../components/configFirebase'
import { collection, query, getDocs } from 'firebase/firestore'
import { signInWithEmailAndPassword, setPersistence, inMemoryPersistence } from 'firebase/auth'
import Layout from '../components/Layout'
import styles from '../styles/Auth.module.css'

function changeColor(event) {
    var inputBox = event.currentTarget
    inputBox.style.color = '#000000'
}

function togglePassword(event) {
    var passwordBox = event.currentTarget.previousElementSibling
}

async function submit(event, router) {
    var email = event.currentTarget.previousElementSibling.previousElementSibling
    var password = email.nextElementSibling
    var showIncorrect = event.currentTarget.nextElementSibling
    const getData = async (type) => {
        const q1 = query(collection(database, type))
        const querySnapshot1 = await getDocs(q1)
        querySnapshot1.forEach((doc) => {
            if (doc.data().EMAIL == email.value && doc.data().PASSWORD == password.value) {
                setPersistence(auth, inMemoryPersistence)
                    .then(() => {
                        return signInWithEmailAndPassword(auth, email.value, password.value)
                    })
                auth.onAuthStateChanged((user) => {
                    if (user) {
                        localStorage.setItem('userID', auth.currentUser.uid)
                        router.push({
                            pathname: '/[userDashboard]',
                            query: { userDashboard: auth.currentUser.uid }
                        })
                    }
                })
            }
        })
    }
    await getData('users')
    await getData('educators')
    await getData('students')
    showIncorrect.style.visibility = 'visible'
}

const Login = () => {
    const router = useRouter()
    return (
        <div style={{ overflowX: 'hidden' }}>
            <Layout title={"Log in"}>
                <form className={styles.frame}
                    style={{ height: '315px' }}
                    onSubmit={(event) => event.preventDefault()}>
                    <h1 className={styles.head2} style={{ marginTop: '10px' }}>Log in</h1>
                    <input type="text" id="email" placeholder="Email" className={styles.input} onClick={(e) => changeColor(e)}></input>
                    <input type="text" id="password" placeholder="Password" className={styles.input} onClick={(e) => changeColor(e)}></input>
                    {/*<p className={styles.hide}
                        onClick={(e) => togglePassword(e)}>
                        Hide
                    </p>
                    <p className={styles.forgotPassword}
                        style={{ marginTop: '-30px', marginBottom: '16px', textAlign: 'right' }}>
                        Forgot password
                    </p>*/}
                    <button className={styles.submit} onClick={(e) => submit(e, router)}>Sign in</button>
                    <p className={styles.p}
                        style={{ color: '#FF0000', visibility: 'hidden', height: '0px', marginTop: '0px' }}>
                        Password or username is incorrect.
                    </p>
                    <p className={styles.p}
                        onClick={() => router.push(('/signup'))}
                        style={{ textAlign: 'center', marginTop: '40px' }}>
                        Don't have an account? <u className={styles.p}>Sign up</u>
                    </p>
                </form>
            </Layout>
        </div>
    )
}

export default Login
