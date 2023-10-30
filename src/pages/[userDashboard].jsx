import { useRouter } from 'next/router'
import { auth, database } from '../components/configFirebase'
import { query, arrayUnion, arrayRemove, collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    ArcElement,
    Tooltip
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    ArcElement,
    BarElement,
    Tooltip
);
import Layout from '../components/Layout'
import styles from '../styles/Dashboard.module.css'

function Logout({ router }) {
    return (
        <button className={styles.logout} onClick={() => {
            localStorage.removeItem('userID')
            signOut(auth).then(() => {
                router.push('/login')
            })
        }}>
        Logout
        </button>
    )
}

function NavButton({ text }) {
    const changeView = (event, text) => {
        var view = event.currentTarget.parentElement.nextElementSibling.firstElementChild.nextElementSibling
        if (text == 'Class') {
            view.style.display = 'flex'
            view.nextElementSibling.style.display = 'none'
            view.nextElementSibling.nextElementSibling.style.display = 'none'
        } else if (text == 'Statistics') {
            view.style.display = 'none'
            view.nextElementSibling.style.display = 'flex'
            view.nextElementSibling.nextElementSibling.style.display = 'none'
        } else {
            view.style.display = 'none'
            view.nextElementSibling.style.display = 'none'
            view.nextElementSibling.nextElementSibling.style.display = 'flex'
        }
    }
    return (
        <button className={styles.navButton}
            onClick={(e) => changeView(e, text)} >{text}
        </button>
    )
}

function Navigation() {
    return (
        <div className={styles.navigation}>
            <NavButton text={'Class'} />
            <NavButton text={'Statistics'} />
            <NavButton text={'Questions'} />
        </div>
    )
}

function Name({ text }) {
    return (
        <div>
            <p className={ styles.name }>{ text }</p>
        </div>
    )
}

function StatNumber({ number, type }) {
    var color = '#F74D4D'
    if (type == 'Correct') {
        color = '#24D140'
    } else if (type == 'Total') {
        color = '#359EE8'
    }
    return (
        <div style={{ backgroundColor: color }} className={styles.stat}>
            <p className={styles.statHeader}>{type}:</p>
            <p className={styles.number}>{number}</p>
            {type != 'Total' && (
                <p className={styles.percent}>%</p>
            )}
        </div>
    )
}

function ClassRanking({ type, uid }) {
    const [classData, setClassData] = useState([])
    const getRanking = async () => {
        var classList = []
        if (type == 'students') {
            const docRef = doc(database, 'students', uid)
            const docSnap = await getDoc(docRef)
            const classCode = docSnap.data().CLASS
            const querySnapshot = await getDocs(collection(database, 'educators'))
            querySnapshot.forEach((doc) => {
                if (doc.data().CLASS == classCode) {
                    classList = doc.data().STUDENTS
                }
            })
        } else if (type == 'educators') {
            const docRef = doc(database, 'educators', uid)
            const docSnap = await getDoc(docRef)
            classList = docSnap.data().STUDENTS
        }
        classList.forEach(async (studentUID) => {
            const docRef = doc(database, 'students', studentUID)
            const docSnap = await getDoc(docRef)
            const studentData = docSnap.data()
            var perWrong = Math.round((studentData.QWRONG / (studentData.QWRONG + studentData.QRIGHT)) * 100)
            var perRight = Math.round((studentData.QRIGHT / (studentData.QWRONG + studentData.QRIGHT)) * 100)
            if (isNaN(perWrong)) {
                perWrong = 0
            }
            if (isNaN(perRight)) {
                perRight = 0
            }
            setClassData(data => [...data, {
                name: studentData.FIRST + ' ' + studentData.LAST,
                percentWrong: perWrong,
                percentRight: perRight,
                totalQuestions: studentData.QWRONG + studentData.QRIGHT
            }])
        })
    }
    useEffect(() => {
        getRanking()
    }, [])
    for (var i = 0; i < classData.length; i++) {   
        for (var j = 0; j < (classData.length - i - 1); j++) {
            if (classData[j].percentRight < classData[j + 1].percentRight) {
                var temp = classData[j]
                classData[j] = classData[j + 1]
                classData[j + 1] = temp
            }
        }
    }
    var number = 0
    if (classData.length < 1) {
        if (type == 'educators') {
            return (
                <div>
                    <p className={styles.header1}>Class Ranking</p>
                    <p className={styles.header3}>No students to display. Register students using the class code to view.</p>
                </div>
            )
        }
    } else {
        return (
            <div>
                <p className={styles.header1}>Class Ranking</p>
                {classData.map((data) => {
                    number++
                    return (
                        <div className={styles.rank} key={number}>
                            <p className={styles.rankingNumber}>{number}</p>
                            <div>
                                <p className={styles.rankingTitle}>{data.name}</p>
                                <div style={{ display: 'inline-flex'}}>
                                    <StatNumber number={data.percentRight} type='Correct' />
                                    <StatNumber number={data.percentWrong} type='Incorrect' />
                                    <StatNumber number={data.totalQuestions} type='Total' />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}

function Class({ type, uid }) {
    const [createCode, setCreateCode] = useState(false)
    const createClass = async (event) => {
        var code = event.currentTarget.previousElementSibling.value
        var error = event.currentTarget.nextElementSibling
        var codeList = []
        const q1 = query(collection(database, 'educators'))
        const querySnapshot1 = await getDocs(q1)
        querySnapshot1.forEach((doc) => {
            codeList.push(doc.data().CLASS)
        })
        if (codeList.includes(code)) {
            const docRef = doc(database, 'educators', uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.data().CLASS != code) {
                error.style.display = 'block'
            }
        } else {
            error.style.display = 'none'
            const docRef = doc(database, type, uid)
            await updateDoc(docRef, {
                CLASS: code
            })
        }
    }
    if (type == 'educators') {
        return (
            <div>
                <p className={styles.header1}>Generate a class </p>
                <p className={styles.header3}>Educators are limited to one class per account.</p>
                <button className={styles.createClass}
                    onClick={() => setCreateCode(true)}>Create class
                </button>
                {createCode == true && (
                    <form onSubmit={(event) => event.preventDefault()}>
                        <p className={styles.header2}>Set a class code: </p>
                        <input type='text' placeholder='new-class' className={styles.setCode} />
                        <input type='submit' value='Save' className={styles.setCode}
                            onClick={(e) => createClass(e)}
                            style={{ cursor: 'pointer' }} />
                        <p className={styles.codeError} style={{ display: 'none' }}>This code is in use.</p>
                    </form>
                )}
                <ClassRanking type={type} uid={uid} />
            </div>
        )
    } else if (type == 'students') {
        return (
            <ClassRanking type={type} uid={uid} />
        )
    } else if (type == 'users') {
        return (
            <div>
                <p className={styles.header1}>No class available</p>
                <p className={styles.header3}>Become an educator or join a class as a student to view classmates.</p>
            </div>
        )
    }
}

function Topic({ topic, number, uid }) {
    const [releasedTopics, setReleasedTopics] = useState([])
    const getTopics = async (event) => {
        const docRef = doc(database, 'educators', uid)
        const docSnap = await getDoc(docRef)
        setReleasedTopics(docSnap.data().TOPICS)
    }
    useEffect(() => {
        getTopics()
    }, [])
    var color = '#E0E0E0'
    if (releasedTopics.includes(topic)) {
        if (number <= 4) {
            color = '#FF887D'
        } else if (number <= 7) {
            color = '#7D9EFF'
        } else if (number <= 10) {
            color = '#CA85FF'
        } else {
            color = '#7DFF99'
        }
    }
    var fixedTopic = topic.replaceAll('-', ' ')
    fixedTopic = fixedTopic.replaceAll('and', '&')
    const changeColor = async (event) => {
        var color = ''
        const button = event.currentTarget
        var questions = button.parentElement.parentElement.parentElement.parentElement.nextElementSibling.nextElementSibling.firstElementChild
        if (button.style.backgroundColor == 'rgb(224, 224, 224)') {
            if (number <= 4) {
                color = '#FF887D'
            } else if (number <= 7) {
                color = '#7D9EFF'
            } else if (number <= 10) {
                color = '#CA85FF'
            } else {
                color = '#7DFF99'
            }
        } else {
            color = '#E0E0E0'
        }
        if (number <= 4) {
            var tempTopic = questions.parentElement.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'none'
            for (let i = 0; i < number - 1; i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.nextElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.parentElement.nextElementSibling.nextElementSibling.style.display = 'none'
            questions.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'none'
            questions.style.display = 'block'
        } else if (number <= 7) {
            var tempTopic = questions.parentElement.nextElementSibling.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            questions = questions.parentElement.nextElementSibling.firstElementChild
            for (let i = 0; i < (number % 5); i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.previousElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.parentElement.nextElementSibling.style.display = 'none'
            questions.parentElement.nextElementSibling.nextElementSibling.style.display = 'none'
            questions.style.display = 'block'
        } else if (number <= 10) {
            var tempTopic = questions.parentElement.nextElementSibling.nextElementSibling.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            questions = questions.parentElement.nextElementSibling.nextElementSibling.firstElementChild
            for (let i = 0; i < (number % 8); i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.previousElementSibling.style.display = 'none'
            questions.parentElement.previousElementSibling.previousElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.parentElement.nextElementSibling.style.display = 'none'
            questions.style.display = 'block'
        } else {
            var tempTopic = questions.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            questions = questions.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild
            for (let i = 0; i < (number % 11); i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.previousElementSibling.style.display = 'none'
            questions.parentElement.previousElementSibling.previousElementSibling.style.display = 'none'
            questions.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.style.display = 'block'
        }
        button.style.backgroundColor = color
        const docRef = doc(database, 'educators', uid)
        if (releasedTopics.includes(topic)) {
            await updateDoc(docRef, {
                TOPICS: arrayRemove(topic)
            })
        } else {
            await updateDoc(docRef, {
                TOPICS: arrayUnion(topic)
            })
        }
    }
    return (
        <button className={styles.topic} style={{ backgroundColor: color }} key={number}
            onClick={ (e) => changeColor(e) }> {fixedTopic}
        </button>
    )
}

function AdaptedTopic({ type, topic, number, uid }) {
    const [releasedTopics, setReleasedTopics] = useState([])
    const getTopics = async (event) => {
        if (type == 'students') {
            const docRef = doc(database, 'students', uid)
            const docSnap = await getDoc(docRef)
            const classCode = docSnap.data().CLASS
            const querySnapshot = await getDocs(collection(database, 'educators'))
            querySnapshot.forEach((doc) => {
                if (doc.data().CLASS == classCode) {
                    setReleasedTopics(doc.data().TOPICS)
                }
            })
        } else if (type == 'users') {
            const docRef = doc(database, 'users', uid)
            const docSnap = await getDoc(docRef)
            setReleasedTopics(docSnap.data().TOPICS)
        }
    }
    useEffect(() => {
        getTopics()
    }, [])
    var color = '#E0E0E0'
    if (releasedTopics.includes(topic)) {
        if (number <= 4) {
            color = '#FF887D'
        } else if (number <= 7) {
            color = '#7D9EFF'
        } else if (number <= 10) {
            color = '#CA85FF'
        } else {
            color = '#7DFF99'
        }
    }
    var fixedTopic = topic.replaceAll('-', ' ')
    fixedTopic = fixedTopic.replaceAll('and', '&')
    const showIncorrect = async (event) => {
        const button = event.currentTarget
        var questions = button.parentElement.parentElement.parentElement.parentElement.nextElementSibling.nextElementSibling.firstElementChild
        if (number <= 4) {
            var tempButton = button.parentElement.parentElement.firstElementChild.firstElementChild
            tempButton.style.border = 'none'
            tempButton.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton2 = tempButton.parentElement.parentElement.nextElementSibling.firstElementChild.firstElementChild
            tempButton2.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton3 = tempButton.parentElement.parentElement.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild
            tempButton3.style.border = 'none'
            tempButton3.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton3.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton4 = tempButton.parentElement.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild
            tempButton4.style.border = 'none'
            tempButton4.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton4.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            button.style.border = '3px solid black'

            var tempTopic = questions.parentElement.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'none'
            for (let i = 0; i < number - 1; i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.nextElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.parentElement.nextElementSibling.nextElementSibling.style.display = 'none'
            questions.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'none'
            questions.style.display = 'block'
        } else if (number <= 7) {
            var tempButton = button.parentElement.parentElement.firstElementChild.firstElementChild
            tempButton.style.border = 'none'
            tempButton.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton2 = tempButton.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild
            tempButton2.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton3 = tempButton.parentElement.parentElement.nextElementSibling.firstElementChild.firstElementChild
            tempButton3.style.border = 'none'
            tempButton3.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton3.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton4 = tempButton.parentElement.parentElement.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild
            tempButton4.style.border = 'none'
            tempButton4.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton4.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            button.style.border = '3px solid black'

            var tempTopic = questions.parentElement.nextElementSibling.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            questions = questions.parentElement.nextElementSibling.firstElementChild
            for (let i = 0; i < (number % 5); i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.previousElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.parentElement.nextElementSibling.style.display = 'none'
            questions.parentElement.nextElementSibling.nextElementSibling.style.display = 'none'
            questions.style.display = 'block'
        } else if (number <= 10) {
            var tempButton = button.parentElement.parentElement.firstElementChild.firstElementChild
            tempButton.style.border = 'none'
            tempButton.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton2 = tempButton.parentElement.parentElement.previousElementSibling.previousElementSibling.firstElementChild.firstElementChild
            tempButton2.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton2.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton3 = tempButton.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild
            tempButton3.style.border = 'none'
            tempButton3.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton3.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            var tempButton4 = tempButton.parentElement.parentElement.nextElementSibling.firstElementChild.firstElementChild
            tempButton4.style.border = 'none'
            tempButton4.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton4.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            button.style.border = '3px solid black'

            var tempTopic = questions.parentElement.nextElementSibling.nextElementSibling.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            questions = questions.parentElement.nextElementSibling.nextElementSibling.firstElementChild
            for (let i = 0; i < (number % 8); i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.previousElementSibling.style.display = 'none'
            questions.parentElement.previousElementSibling.previousElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.parentElement.nextElementSibling.style.display = 'none'
            questions.style.display = 'block'
        } else {
            var tempButton = button.parentElement.parentElement.firstElementChild.firstElementChild
            tempButton.style.border = 'none'
            tempButton.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            tempButton = tempButton.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild
            tempButton.style.border = 'none'
            tempButton.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            tempButton = tempButton.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild
            tempButton.style.border = 'none'
            tempButton.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            tempButton = tempButton.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild
            tempButton.style.border = 'none'
            tempButton.parentElement.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'
            tempButton.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.style.border = 'none'

            button.style.border = '3px solid black'

            var tempTopic = questions.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild
            tempTopic.style.display = 'none'
            tempTopic.nextElementSibling.style.display = 'none'
            tempTopic.nextElementSibling.nextElementSibling.style.display = 'none'
            questions = questions.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild
            for (let i = 0; i < (number % 11); i++) {
                questions = questions.nextElementSibling
            }
            questions.parentElement.previousElementSibling.style.display = 'none'
            questions.parentElement.previousElementSibling.previousElementSibling.style.display = 'none'
            questions.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.style.display = 'none'
            questions.parentElement.style.display = 'block'
            questions.style.display = 'block'
        }
    }
    return (
        <button className={styles.topic} style={{ backgroundColor: color }} key={number}
            onClick={(e) => showIncorrect(e)}> {fixedTopic}
        </button>
    )
}

function ViewTopic({ type, topic, number, uid }) {
    const [releasedTopics, setReleasedTopics] = useState([])
    const getTopics = async (event) => {
        if (type == 'students') {
            const docRef = doc(database, 'students', uid)
            const docSnap = await getDoc(docRef)
            const classCode = docSnap.data().CLASS
            const querySnapshot = await getDocs(collection(database, 'educators'))
            querySnapshot.forEach((doc) => {
                if (doc.data().CLASS == classCode) {
                    setReleasedTopics(doc.data().TOPICS)
                }
            })
        } else if (type == 'users') {
            const docRef = doc(database, 'users', uid)
            const docSnap = await getDoc(docRef)
            setReleasedTopics(docSnap.data().TOPICS)
        }
    }
    useEffect(() => {
        getTopics()
    }, [])
    var color = '#E0E0E0'
    if (releasedTopics.includes(topic)) {
        if (number <= 4) {
            color = '#FF887D'
        } else if (number <= 7) {
            color = '#7D9EFF'
        } else if (number <= 10) {
            color = '#CA85FF'
        } else {
            color = '#7DFF99'
        }
    }
    var fixedTopic = topic.replaceAll('-', ' ')
    fixedTopic = fixedTopic.replaceAll('and', '&')
    return (
        <button className={styles.topic} style={{ backgroundColor: color, cursor: 'auto' }} key={number} >
            {fixedTopic}
        </button>
    )
}

function ChemistryQuestion({ studentAnswer, question, answer, explanation, subtopic, number }) {
    const toggleExplanation = (event) => {
        var toggleButton = event.currentTarget.previousElementSibling
        if (toggleButton.style.display == 'none') {
            toggleButton.style.display = 'flex'
        } else {
            toggleButton.style.display = 'none'
        }
    }
    return (
        <div style={{ width: '100%', marginBottom: '50px', display: 'inline-flex', verticalAlign: 'top' }}>
            <p className={styles.rankingNumber} style={{ margin: '0px', marginRight: '15px' }}>{number}</p>
            <div>
                <p className={styles.header2} style={{ marginTop: '0px' }}>{question}</p>
                <p className={styles.subtopic}>{subtopic}</p>
                {studentAnswer != 'none' && (
                    <p className={styles.header3}>Your answer: {studentAnswer}</p>
                )}
                <p className={styles.header3}>Correct answer: {answer}</p>
                <p style={{ display: 'none' }}>Explanation: {explanation}</p>
                <button className={styles.submitTopics} style={{ marginTop: '0px' }}
                    onClick={(e) => toggleExplanation(e)}>Toggle explanation
                </button>
            </div>
        </div>
    )
}

function IncorrectQuestions({ topic, uid, type }) {
    const [questions, setQuestions] = useState([])
    var fixedTopic = topic.replaceAll('-', ' ')
    fixedTopic = fixedTopic.replaceAll('and', '&')
    const getQuestions = async () => {
        const docRef1 = doc(database, type, uid, 'incorrect-questions', topic)
        const docSnap1 = await getDoc(docRef1)
        Object.keys(docSnap1.data()).forEach((subtopic) => {
            var numWrong = docSnap1.data().QWRONG
            if (numWrong > 0 && subtopic != 'QWRONG' && Object.keys(docSnap1.data()[subtopic]).length > 0) {
                Object.keys(docSnap1.data()[subtopic]).forEach(async (question) => {
                    const docRef2 = doc(database, 'questions', docSnap1.id, subtopic, question)
                    const docSnap2 = await getDoc(docRef2)
                    var fixedSubtopic = subtopic.replaceAll('-', ' ')
                    fixedSubtopic = fixedSubtopic.replaceAll('and', '&')
                    if(docSnap2.data()) {
                        setQuestions(data => [...data, {
                            SUBTOPIC: fixedSubtopic,
                            QUESTION: docSnap2.data().QUESTION,
                            ANSWER: docSnap2.data().ANSWER,
                            STUDENTANSWER: docSnap1.data()[subtopic][question],
                            EXPLANATION: docSnap2.data().EXPLANATION
                        }])
                    }
                })
            }
        })
    }
    useEffect(() => {
        getQuestions()
    }, [])
    var number = 0
    return (
        <div>
            <p className={styles.header2} style={{ textTransform: 'capitalize', marginTop: '0px', marginBottom: '20px' }}>{fixedTopic}</p>
            {questions.map((question) => {
                number++
                return (
                    <div key={number}>
                        <ChemistryQuestion question={question.QUESTION}
                            answer={question.ANSWER}
                            explanation={question.EXPLANATION}
                            subtopic={question.SUBTOPIC}
                            number={number}
                            studentAnswer={question.STUDENTANSWER} />
                    </div>
                )
            })}
        </div>
    )
}

function QuestionPreview({ topic, subtopicList }) {
    const [questions, setQuestions] = useState([])
    var [numQuestions, setNumQuestions] = useState(1)
    var fixedTopic = topic.replaceAll('-', ' ')
    fixedTopic = fixedTopic.replaceAll('and', '&')
    const getQuestions = async () => {
        subtopicList.forEach(async (subtopic) => {
            var fixedSubtopic = subtopic.replaceAll('-', ' ')
            fixedSubtopic = fixedSubtopic.replaceAll('and', '&')
            const collectionRef = query(collection(database, 'questions', topic, subtopic))
            const querySnapshot = await getDocs(collectionRef)
            querySnapshot.forEach((doc) => {
                if (numQuestions > 0 && numQuestions % 4 != 0) {
                    setNumQuestions(numQuestions++)
                    setQuestions(data => [...data, {
                        SUBTOPIC: fixedSubtopic,
                        QUESTION: doc.data().QUESTION,
                        ANSWER: doc.data().ANSWER,
                        EXPLANATION: doc.data().EXPLANATION
                    }])
                }
            })
        })
    }
    useEffect(() => {
        getQuestions()
    }, [])
    var number = 0
    return (
        <div>
            <p className={styles.header2} style={{ textTransform: 'capitalize', marginTop: '0px', marginBottom: '20px' }}>{fixedTopic}</p>
            {questions.map((question) => {
                number++
                return (
                    <div key={number}>
                        <ChemistryQuestion question={question.QUESTION}
                            answer={question.ANSWER}
                            explanation={question.EXPLANATION}
                            subtopic={question.SUBTOPIC}
                            number={number} />
                    </div>
                )
            })}
        </div>
    )
}

function Questions({ type, uid }) {
    const [topics, setTopics] = useState([])
    var number = 0
    var traverseSubtopics = 0
    var topicList = [
        ['math-basics', 'atoms-and-molecules', 'stoichiometry', 'states-of-matter'],
        ['chemical-reactions', 'periodic-trends', 'solutions'],
        ['gases', 'acids-and-bases', 'thermochemistry-and-physical-chemistry'],
        ['kinetics', 'atomic-and-electronic-structure', 'nuclear-chemistry']
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
    if (type == 'students' || type == 'users') {
        return (
            <div>
                <p className={styles.header1}>Unlocked Topics</p>
                <p className={styles.header3}>These chemistry topics have been unlocked by your educator. Click on a question topic to review problems.</p>
                <div style={{ display: 'grid' }}>
                    <div style={{ display: 'inline-flex' }}>
                        <div style={{ display: 'grid' }}>
                            {topicList[0].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <AdaptedTopic type={type} uid={uid} topic={topic} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ display: 'block' }}>
                            {topicList[1].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <AdaptedTopic type={type} uid={uid} topic={topic} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ display: 'block' }}>
                            {topicList[2].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <AdaptedTopic type={type} uid={uid} topic={topic} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ display: 'block' }}>
                            {topicList[3].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <AdaptedTopic type={type} uid={uid} topic={topic} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <button className={styles.submitTopics}>Save</button>
                </div>
                <p className={styles.header1}>Incorrect Answers</p>
                <div>
                    {topicList[0].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <IncorrectQuestions topic={topic} uid={uid} type={type} />
                            </div>
                        )
                    })}
                </div>
                <div>
                    {topicList[1].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <IncorrectQuestions topic={topic} uid={uid} type={type} />
                            </div>
                        )
                    })}
                </div>
                <div>
                    {topicList[2].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <IncorrectQuestions topic={topic} uid={uid} type={type} />
                            </div>
                        )
                    })}
                </div>
                <div>
                    {topicList[3].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <IncorrectQuestions topic={topic} uid={uid} type={type} />
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    } else if (type == 'educators') {
        return (
            <div>
                <p className={styles.header1}>Unlock Topics</p>
                <p className={styles.header3}>Click on a question topic to unlock problems for students to practice.</p>
                <div style={{ display: 'grid' }}>
                    <div style={{ display: 'inline-flex' }}>
                        <div style={{ display: 'grid' }}>
                            {topicList[0].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <Topic topic={topic} uid={uid} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ display: 'block' }}>
                            {topicList[1].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <Topic topic={topic} uid={uid} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ display: 'block' }}>
                            {topicList[2].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <Topic topic={topic} uid={uid} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ display: 'block' }}>
                            {topicList[3].map((topic) => {
                                number++
                                return (
                                    <div key={number}>
                                        <Topic topic={topic} uid={uid} number={number} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <button className={styles.submitTopics}>Save</button>
                </div>
                <p className={styles.header1}>Question Preview</p>
                <div>
                    {topicList[0].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <QuestionPreview topic={topic} subtopicList={subtopicList[traverseSubtopics - 1]} />
                            </div>
                        )
                    })}
                </div>
                <div>
                    {topicList[1].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <QuestionPreview topic={topic} subtopicList={subtopicList[traverseSubtopics - 1]} />
                            </div>
                        )
                    })}
                </div>
                <div>
                    {topicList[2].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <QuestionPreview topic={topic} subtopicList={subtopicList[traverseSubtopics - 1]} />
                            </div>
                        )
                    })}
                </div>
                <div>
                    {topicList[3].map((topic) => {
                        traverseSubtopics++
                        return (
                            <div key={traverseSubtopics}>
                                <QuestionPreview topic={topic} subtopicList={subtopicList[traverseSubtopics - 1]} />
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

function ToggleStudents({ classList }) {
    const viewStudent = (event, num) => {
        var chart = event.currentTarget.parentElement.nextElementSibling.firstElementChild
        while (chart != null) {
            chart.style.display = 'none'
            chart = chart.nextElementSibling 
        }
        chart = event.currentTarget.parentElement.nextElementSibling.firstElementChild
        let i = 0
        while (i < num - 1) {
            chart = chart.nextElementSibling
            i++
        }
        chart.style.display = 'block'
    }
    var number = -1
    return (
        <div className={styles.navigation}>
            {classList.map((data) => {
                number++
                return (
                    <button className={styles.navButton} key={number}> 
                        {data.name}
                    </button>
                )
            })}
        </div>
    )
}

function BarGraph({ uid, name, type }) {
    const [labels, setLabels] = useState([])
    const [data, setData] = useState([])
    const colors = ['#FF887D', '#7D9EFF', '#CA85FF', '#7DFF99']
    const getData = async () => {
        const q1 = query(collection(database, type, uid, 'incorrect-questions'))
        const querySnapshot1 = await getDocs(q1)
        querySnapshot1.forEach((doc) => {
            var caption = doc.id.replaceAll('-', ' ')
            setLabels(data => [...data, caption])
            setData(data => [...data, doc.data().QWRONG])
        })
    }
    useEffect(() => {
        getData()
    }, [])
    return (
        <div style={{ width: '600px', marginBottom: '50px', border: '2px solid black' }}>
            {name != null && (
                <p className={styles.header3} style={{ textTransform: 'capitalize' }}>{name}</p>
            )}
            <Bar
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: data,
                            backgroundColor: colors
                        },
                    ],
                }}
                options={{
                    scales: {
                        y: {
                            ticks: {
                                stepSize: 5
                            }
                        },
                        x: {
                            ticks: {
                                callback: function (value) {
                                    const label = this.getLabelForValue(Number(value))
                                    if (typeof label === 'string' && label.length > 10) {
                                        return `${label.substring(0, 5)}...`
                                    }
                                    return label
                                },
                            },
                        }
                    }
                }}
            />
        </div>
    )
}

function PieChart({ uid, name, type }) {
    const [labels, setLabels] = useState([])
    const [data, setData] = useState([])
    const colors = ['#FF887D', '#7D9EFF', '#CA85FF', '#7DFF99']
    const getData = async () => {
        const q1 = query(collection(database, type, uid, 'incorrect-questions'))
        const querySnapshot1 = await getDocs(q1)
        querySnapshot1.forEach((doc) => {
            var caption = doc.id.replaceAll('-', ' ')
            setLabels(data => [...data, caption])
            setData(data => [...data, doc.data().QWRONG])
        })
    }
    useEffect(() => {
        getData()
    }, [])
    var numZeroes = 0
    data.forEach((number) => {
        if (number == 0) {
            numZeroes++
        }
    })
    if (numZeroes == 13) {
        return (
            <div>
                <p className={styles.header1}>No data to display</p>
                <p className={styles.header3}>Play ChemQuest and answer questions to view statistics.</p>
            </div>
        )
    } else {
        return (
            <div>
                {name != null && (
                    <p className={styles.header3}>{name}</p>
                )}
                <Doughnut
                    data={{
                        labels: labels,
                        datasets: [
                            {
                                data: data,
                                backgroundColor: colors
                            },
                        ],
                    }}
                    height='400px'
                    width='400px'
                    options={{ maintainAspectRatio: false }}
                />
            </div>
        )
    }
}

function Statistics({ type, uid }) {
    var topicList = [
        ['math-basics', 'atoms-and-molecules', 'stoichiometry', 'states-of-matter'],
        ['chemical-reactions', 'periodic-trends', 'solutions'],
        ['gases', 'acids-and-bases', 'thermochemistry-and-physical-chemistry'],
        ['kinetics', 'atomic-and-electronic-structure', 'nuclear-chemistry']
    ]
    if (type == 'educators') {
        const [classData, setClassData] = useState([])
        const getStudentData = async () => {
            const docRef = doc(database, 'educators', uid)
            const docSnap = await getDoc(docRef)
            const classList = docSnap.data().STUDENTS
            classList.forEach(async (studentUID) => {
                const docRef = doc(database, 'students', studentUID)
                const docSnap = await getDoc(docRef)
                const studentData = docSnap.data()
                setClassData(data => [...data, {
                    name: studentData.FIRST + ' ' + studentData.LAST,
                    id: studentUID
                }])
            })
        }
        useEffect(() => {
            getStudentData()
        }, [])
        if (classData.length < 1) {
            return (
                <div>
                    <p className={styles.header1}>Students</p>
                    <p className={styles.header3}>No students to display. Register students using the class code to view.</p>
                </div>
            )
        } else {
            var number = 0
            return (
                <div>
                    <p className={styles.header1}>Students</p>
                    <div style={{ display: 'inline-flex' }}>
                        <ToggleStudents classList={classData} />
                        <div>
                            <p className={styles.header2}>Incorrect answers:</p>
                            {classData.map((data) => {
                                number++
                                return (
                                    <BarGraph uid={data.id} name={data.name} type='students' key={number} />
                                )
                            })}
                        </div>
                    </div>
                </div>
            )
        }
    } else {
        var number = 0
        return (
            <div>
                <p className={styles.header1}>Incorrect answers:</p>
                <div style={{ display: 'inline-flex', marginBottom: '30px' }}>
                    <div style={{ display: 'grid' }}>
                        {topicList[0].map((topic) => {
                            number++
                            return (
                                <div key={number}>
                                    <ViewTopic type={type} uid={uid} topic={topic} number={number} />
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ display: 'block' }}>
                        {topicList[1].map((topic) => {
                            number++
                            return (
                                <div key={number}>
                                    <ViewTopic type={type} uid={uid} topic={topic} number={number} />
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ display: 'block' }}>
                        {topicList[2].map((topic) => {
                            number++
                            return (
                                <div key={number}>
                                    <ViewTopic type={type} uid={uid} topic={topic} number={number} />
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ display: 'block' }}>
                        {topicList[3].map((topic) => {
                            number++
                            return (
                                <div key={number}>
                                    <ViewTopic type={type} uid={uid} topic={topic} number={number} />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <PieChart uid={uid} type={type} key={number} />
            </div>
        )
    }
}

export async function getServerSideProps(context) {
    const userID = context.params.userDashboard
    var userData = null
    const q1 = query(collection(database, 'educators'))
    const querySnapshot1 = await getDocs(q1)
    querySnapshot1.forEach((doc) => {
        if (doc.id == userID) {
            userData = {
                TYPE: 'educators',
                FIRST: doc.data().FIRST,
                LAST: doc.data().LAST,
                USERNAME: doc.data().USERNAME,
                UID: userID
            }
        }
    })
    const q2 = query(collection(database, 'students'))
    const querySnapshot2 = await getDocs(q2)
    querySnapshot2.forEach((doc) => {
        if (doc.id == userID) {
            userData = {
                TYPE: 'students',
                FIRST: doc.data().FIRST,
                LAST: doc.data().LAST,
                USERNAME: doc.data().USERNAME,
                UID: userID
            }
        }
    })
    const q3 = query(collection(database, 'users'))
    const querySnapshot3 = await getDocs(q3)
    querySnapshot3.forEach((doc) => {
        if (doc.id == userID) {
            userData = {
                TYPE: 'users',
                FIRST: doc.data().FIRST,
                LAST: doc.data().LAST,
                USERNAME: doc.data().USERNAME,
                UID: userID
            }
        }
    })
    return {
        props: userData
    }
}

function Dashboard(props) {
    const router = useRouter()
    return (
        <div style={{backgroundColor: '#FFFFFF'}}>
            <Layout title={'Dashboard'}>
                <div style={{ display: 'inline-flex', padding: '50px' }}>
                    <Navigation />
                    <div style={{ display: 'block' }}>
                        <Name text={props.FIRST + ' ' + props.LAST} />
                        <div>
                            <Class type={props.TYPE} uid={props.UID} />
                        </div>
                        <div style={{ display: 'none' }}>
                            <Statistics type={props.TYPE} uid={props.UID} />
                        </div>
                        <div style={{ display: 'none' }}>
                            <Questions type={props.TYPE} uid={props.UID} />
                        </div>
                        <Logout router={ router } />
                    </div>
                </div>
            </Layout>
        </div>
    )
}

export default Dashboard
