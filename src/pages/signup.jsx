import { useRouter } from 'next/router'
import { auth, database } from '../components/configFirebase'
import { collection, doc, setDoc, query, getDocs, updateDoc, arrayUnion } from 'firebase/firestore'
import { createUserWithEmailAndPassword, setPersistence, inMemoryPersistence } from 'firebase/auth'
import Layout from '../components/Layout'
import styles from '../styles/Auth.module.css'

function changeColor(event) {
    var inputBox = event.currentTarget
    inputBox.style.color = '#000000'
}

function toggleTeacher(event) {
    var text = event.currentTarget.parentElement.parentElement
    for (let i = 0; i < 5; i++) {
        text = text.nextElementSibling
    }
    var emailBox = event.currentTarget.parentElement.parentElement
    for (let i = 0; i < 3; i++) {
        emailBox = emailBox.nextElementSibling
    }
    var codeBox = event.currentTarget.parentElement.parentElement
    for (let i = 0; i < 6; i++) {
        codeBox = codeBox.nextElementSibling
    }
    if (event.currentTarget.checked) {
        codeBox.style.visibility = 'hidden'
        codeBox.style.height = '0px'
        codeBox.style.marginBottom = '-2px'
        codeBox.value = ''
        emailBox.style.visibility = 'visible'
        emailBox.style.height = '40px'
        emailBox.style.marginBottom = '10px'
        if (text.innerHTML.includes('Not a')) {
            text.innerHTML = "Are you a" + text.innerHTML.substring(5)
        }
    }
}

async function setDatabase(data, type, uid) {
    var topicList = [
        'math-basics', 'atoms-and-molecules', 'stoichiometry', 'states-of-matter',
        'chemical-reactions', 'periodic-trends', 'solutions',
        'gases', 'acids-and-bases', 'thermochemistry-and-physical-chemistry',
        'kinetics', 'atomic-and-electronic-structure', 'nuclear-chemistry'
    ]
    var subtopicList = [
        ['metric-prefixes', 'physical-constants', 'scientific-notation', 'significant-figures', 'temperature-conversions'],
        ['atom-basics', 'atomic-mass-and-atomic-number', 'ionic-and-covalent-bonds', 'oxidation-numbers'],
        ['balance-equations', 'balance-redox-reactions', 'gram-to-mole-conversions', 'limiting-reactant-and-theoretical-yield'],
        ['phase-diagrams', 'states-of-matter'],
        ['chemical-reactions', 'reactions-in-water'],
        ['element-groups', 'periodic-properties-and-trends'],
        ['calculating-concentration', 'types-of-mixtures'],
        ["boyle's-law", "charles'-law", "dalton's-law-of-partial-pressures", "ideal-gases"],
        ['buffers', 'common-acids-and-bases', 'henderson-hasselbalch-equation', 'salt-formation', 'titration'],
        ['bond-energy-and-enthalpy-change', 'calorimetry-and-heat-flow', 'endothermic-and-exothermic-reactions', 'laws-of-thermochemistry'],
        ['chemical-reaction-order', 'reaction-rate'],
        ['aufbau-principle', 'electron-configuration', 'electron-orbitals-and-quantum-numbers', 'valence-electrons'],
        ['atomic-abundance', 'isotopes-and-nuclear-symbols', 'radioactive-decay']
    ]
    var password = data[0]
    var username = data[1]
    var lastName = data[2]
    var firstName = data[3]
    var email = data[4]
    var classCode = data[5]
    if (type == 'educators') {
        await setDoc(doc(database, type, uid), {
            FIRST: firstName,
            LAST: lastName,
            PASSWORD: password,
            USERNAME: username,
            EMAIL: email,
            CLASS: classCode,
            TOPICS: [],
            STUDENTS: []
        })
    } else {
        await setDoc(doc(database, type, uid), {
            FIRST: firstName,
            LAST: lastName,
            PASSWORD: password,
            USERNAME: username,
            EMAIL: email,
            QWRONG: 0,
            QRIGHT: 0,
            CLASS: classCode,
            TOPICS: [],
            PASSES: 0
        })
        var index = 0
        topicList.forEach(async (topic) => {
            await setDoc(doc(database, type, uid, 'incorrect-questions', topic), {
                QWRONG: 0
            })
            subtopicList[index].forEach(async(subtopic) => {
                await updateDoc(doc(database, type, uid, 'incorrect-questions', topic), {
                    [subtopic]: {}
                })
            })
            index++
        })
        if (type == 'users') {
            await updateDoc(doc(database, type, uid), {
                TOPICS: topicList
            })
        } else {
            var educatorID = ''
            const q1 = query(collection(database, 'educators'))
            const querySnapshot1 = await getDocs(q1)
            querySnapshot1.forEach((doc) => {
                if (doc.data().CLASS == classCode) {
                    educatorID = doc.id
                }
            })
            await updateDoc(doc(database, 'educators', educatorID), {
                STUDENTS: arrayUnion(uid)
            })
        }
    }
}

async function submit(event, router) {
    var code = event.currentTarget.previousElementSibling
    var password = code.previousElementSibling.previousElementSibling
    var email = password.previousElementSibling
    var username = email.previousElementSibling
    var lastName = username.previousElementSibling.lastElementChild
    var firstName = lastName.previousElementSibling
    var educator = username.previousElementSibling.previousElementSibling.lastElementChild.firstElementChild
    var warning = event.currentTarget.nextElementSibling
    var login = false
    var data = [
        password.value,
        username.value,
        lastName.value,
        firstName.value,
        email.value,
        code.value
    ]
    var usedEmails = []
    const getEmails = async (type) => {
        const q1 = query(collection(database, type))
        const querySnapshot1 = await getDocs(q1)
        querySnapshot1.forEach((doc) => {
            usedEmails.push(doc.data().EMAIL)
        })
    }
    var classCodes = []
    const q1 = query(collection(database, 'educators'))
    const querySnapshot1 = await getDocs(q1)
    querySnapshot1.forEach((doc) => {
        classCodes.push(doc.data().CLASS)
    })
    await getEmails('users')
    await getEmails('educators')
    await getEmails('students')
    if (code.style.visibility == 'hidden') {
        login = true
    } else if (code.style.visibility == 'visible' && code.value != '') {
        login = true
    } else {
        login = false
    }
    for (let i = 0; i < data.length - 1; i++) {
        if (data[i] == '') {
            login = false
        }
    }
    if (data[0].length < 6) {
        login = false
        warning.innerHTML = 'Password must be longer than 6 characters.'
        warning.style.visibility = 'visible'
        warning.style.marginBottom = '14px'
        warning.style.marginTop = '4px'
    }
    if (login) {
        await setPersistence(auth, inMemoryPersistence)
            .then(() => {
                if (code.style.visibility == 'visible' && !classCodes.includes(code.value)) {
                    login = false
                    warning.innerHTML = 'Invalid class code.'
                    warning.style.visibility = 'visible'
                    warning.style.marginBottom = '14px'
                    warning.style.marginTop = '4px'
                } else {
                    return createUserWithEmailAndPassword(auth, email.value, password.value)
                }
            }).catch((error) => {
                login = false
                warning.innerHTML = "Email invalid or in use."
                warning.style.visibility = 'visible'
                warning.style.marginBottom = '14px'
                warning.style.marginTop = '4px'
            })
        if (auth.currentUser) {
            if (educator.checked) {
                setDatabase(data, 'educators', auth.currentUser.uid)
            } else if (code.style.visibility == 'visible') {
                setDatabase(data, 'students', auth.currentUser.uid)
            } else {
                setDatabase(data, 'users', auth.currentUser.uid)
            }
            router.push({
                pathname: '/[userDashboard]',
                query: { userDashboard: auth.currentUser.uid }
            })
        }
    } else {
        if (data[0].length >= 6) {
            warning.innerHTML = "Please complete all fields."
        }
        warning.style.visibility = 'visible'
        warning.style.marginBottom = '14px'
        warning.style.marginTop = '4px'
    }
}

function toggleStudent(event) {
    var text = event.currentTarget
    var form = event.currentTarget.parentElement
    var codeBox = event.currentTarget.nextElementSibling
    var emailBox = event.currentTarget.previousElementSibling.previousElementSibling
    var toggle = emailBox.previousElementSibling.previousElementSibling.previousElementSibling.lastElementChild.firstElementChild
    if (codeBox.style.visibility == 'hidden') {
        codeBox.style.visibility = 'visible'
        codeBox.style.height = '40px'
        codeBox.style.marginBottom = '10px'
        form.style.height = '525px'
        if (toggle.checked) {
            toggle.click()
        }
        text.innerHTML = "Not a" + text.innerHTML.substring(9)
    } else {
        codeBox.style.visibility = 'hidden'
        codeBox.style.value = ''
        codeBox.style.height = '0px'
        codeBox.style.marginBottom = '-2px'
        if (toggle.checked) {
            toggle.click()
        }
        form.style.height = '480px'
        text.innerHTML = "Are you a" + text.innerHTML.substring(5)
    }
}

const Signup = () => {
    const router = useRouter()
    return (
        <div style={{overflowX: 'hidden'}}>
        <Layout title={"Sign Up"}>
            <form className={styles.frame} onSubmit={(event) => event.preventDefault()}>
                <h1 className={styles.head2}>Sign up</h1>
                <div style={{ display: 'inline-flex', justifyContent: 'right', width: '100%' }}>
                    <p className={styles.p}>
                        Are you a <u className={styles.p}>parent</u> or a <u className={styles.p}>teacher</u>?
                    </p>
                    <label className={styles.switch}>
                        <input type="checkbox" onClick={(e) => toggleTeacher(e)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div style={{ display: "inline-flex", justifyContent: "space-between" }}>
                    <input type="text" id="firstName" placeholder="First" className={styles.input} onClick={(e) => changeColor(e)} required></input>
                    <input type="text" id="lastName" placeholder="Last" className={styles.input} onClick={(e) => changeColor(e)} required></input>
                </div>
                <input type="text" id="username" placeholder="Username" className={styles.input} onClick={(e) => changeColor(e)} required></input>
                <input type="text" id="email" placeholder="Email" className={styles.input}
                    onClick={(e) => changeColor(e)}>
                </input>
                <input type="text" id="password" placeholder="Password" className={styles.input} onClick={(e) => changeColor(e)} required></input>
                <p className={styles.p}
                    onClick={(e) => toggleStudent(e)}>
                    Are you a <u className={styles.p}>student</u>?
                </p>
                <input type="text" id="classCode" placeholder="Join code" className={styles.input}
                    style={{ visibility: 'hidden', height: '0px', marginBottom: '-2px' }}
                    onClick={(e) => changeColor(e)}>
                </input>
                <button className={styles.submit} onClick={(e) => submit(e, router)}>Sign up</button>
                <p className={styles.p}
                        style={{ color: '#FF0000', visibility: 'hidden', height: '0px', marginTop: '0px' }}>
                    Please complete all fields.
                </p>
                <p className={styles.p}
                    onClick={() => router.push(('/login'))}
                    style={{ textAlign: 'center', marginTop: '35px' }}>
                    Already have an account? <u className={styles.p}>Log in</u>
                </p>
            </form>
        </Layout>
        </div>
    )
}

export default Signup