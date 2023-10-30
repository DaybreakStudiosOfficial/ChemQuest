import Head from 'next/head'
import { useEffect } from 'react'
import styles from '../styles/Game.module.css'

const Game = () => {
    useEffect(() => {
        async function initGame() {
            const { default: Phaser } = await import('phaser')
            const { default: Middletown } = await import('../scenes/Middletown')
            const { default: TowerInterior } = await import('../scenes/TowerInterior')
            const { default: Labyrinth } = await import('../scenes/Labyrinth')
            const { default: Quiz } = await import('../scenes/Quiz')

            const game = new Phaser.Game({
                title: 'ChemQuest',
                parent: 'gameContent',
                backgroundColor: '#051D37',
                pixelArt: true,
                type: Phaser.AUTO,
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                },
                physics: {
                    default: 'matter',
                    matter: {
                        debug: false,
                        gravity: {
                            y: 0
                        }
                    }
                },
                scene: [
                    Middletown,
                    TowerInterior,
                    Labyrinth,
                    Quiz
                ]
            })
        }
        initGame();
    }, [])

    return (
        <div className={styles.game}
            id='gameContent'
            key='gameContent'>
            <Head>
                <title>Play ChemQuest</title>
            </Head>
        </div>
    )
}

export default Game