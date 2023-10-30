import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/navigation'

function GetStartedButton({ color, size }) {
    const router = useRouter()
    var textColor = "white"
    var style = {}
    if (size == "large") {
        style = styles.getStartedLarge
    } else if (size == "small") {
        style = styles.getStartedSmall
    }
    if (color == "white") {
        textColor = "black"
    }

    return (
        <button
            className={style}
            onClick={() => router.push('/signup')}
            style={{ backgroundColor: color, color: textColor }}>Get started
        </button>
    )
}

function Section({ color, children }) {
    return (
        <div
            className={styles.section}
            style={{ backgroundColor: color, display: 'inline-flex' }}>
            {children}
        </div>
    )
}

function Description({ color, align, children }) {
    var style = {}
    if (align == "right") {
        style = { right: 0, background: color }
    } else if (align == "left") {
        style = { left: 0, background: color }
    }
    return (
        <section
            className={styles.description}
            style={style}>
            {children}
        </section>
    )
}

function List({ color, list }) {
    return (
        <ul className={styles.list} style={{ color: color }}>
            {list.map((item) => (
                <li style={{ color: color }} key={item}>{item}</li>
            ))}
        </ul>
    )
}

function LearnMore({ color }) {
    const router = useRouter()
    return (
        <a href='/learnMore'
            className={styles.learnMore}
            style={{ color: color }}>
            <u className={styles.learnMore} style={{ color: color, textDecoration: "none" }}>Learn more</u> &rarr;
        </a>
    )
}

export default function Home() {
    const parentTeacherList = [
        "Create an online classroom",
        "Monitor student progress",
        "Assign topics as classwork",
        "See class rankings"
    ]
    const studentList = [
        "Solve chemistry problems",
        "Chat with in-game characters",
        "Battle enemies and monsters",
        "Reach the top of the rankings"
    ]
    return (
        <Layout title={"Home"}>
            {/*Main section*/}
            <section className={styles.mainSection}>
                <img src='/middletownImage4.png' className={styles.mainImage} />
                <h1 className={styles.title}>ChemQuest</h1>
                <p className={styles.tagline}>Learn the foundations of chemistry through engaging gameplay and challenging practice problems.</p>
                <GetStartedButton color={"#6320EE"} size={"large"} />
            </section>

            {/*Parent and teacher section*/}
            <Section color={"white"}>
                <img src='/classRankingsImage.png' style={{ width: '95%' }} />
                <Description color={"#D0D0D0"} align={"right"}>
                    <h1 className={styles.head1} style={{ color: "black" }}>For teachers and parents</h1>
                    <List color={"black"} list={parentTeacherList} />
                    <LearnMore color={"black"} />
                    <GetStartedButton color={"#6320EE"} size={"small"} />
                </Description>
            </Section>

            {/*Student section*/}
            <Section color={"#060217"}>
                <Description color={"#0C0C2B"} align={"left"}>
                    <h1 className={styles.head1} style={{ color: "white" }}>For students</h1>
                    <List color={"white"} list={studentList} />
                    <LearnMore color={"white"} />
                    <GetStartedButton color={"white"} size={"small"} />
                </Description>
                <img src='/towerInterior.png' />
            </Section>

            {/*Everyone section*/}
            <Section color={"#08081A"}>
                <img src='/gameplayImage.png' />
                <Description color={"#D0D0D0"} align={"right"}>
                    <h1 className={styles.head1} style={{ color: "black" }}>For everyone</h1>
                    <p className={styles.list} style={{ fontSize: "18px" }}>Not a teacher or a student? Play solo with these functionalities.</p>
                    <LearnMore color={"black"} />
                    <GetStartedButton color={"#8075FF"} size={"small"} />
                </Description>
            </Section>
        </Layout>
    )
}
