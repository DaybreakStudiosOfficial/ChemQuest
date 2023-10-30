import Phaser from 'phaser'
import Player from '../classes/player'
import Object from '../classes/object'
import TextBox from '../classes/textBox'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

class TowerInterior extends Phaser.Scene {
    constructor() {
        super({ key: 'TowerInterior' })
    }
    preload() {
        this.load.image('towerRoomBackground', '/assets/towerRoomBackground.png')
        this.load.image('player', '/assets/player.png')
        this.load.image('circle', '/assets/circle.png')
        this.load.image('portal', '/assets/portal.png')
        this.load.image('bookshelf', '/assets/bookshelf.png')
        this.load.spritesheet('torch', '/assets/torch.png', {
            frameWidth: 6,
            frameHeight: 11
        })
        this.load.image('spaceKey', '/assets/spaceKey.png')
        this.load.image('gladys', '/assets/characters/gladys.png')
        this.load.spritesheet('buttons', 'assets/util/buttons.png', {
            frameWidth: 11,
            frameHeight: 11
        })
        this.load.audio('towerMusic', ['/musicSound/towerMusic.mp3'])
    }
    create() {
        var music = this.sound.add('towerMusic', {
            loop: true
        })
        const marker = {
            name: '',
            start: 0,
            duration: music.duration,
            config: {
                mute: false,
                loop: false,
                delay: 2000
            }
        }
        music.addMarker(marker)
        music.play(marker)
        Object.objectList = []

        // initialize player
        const zoom = 4
        this.player = new Player(this, 21, 60, 'player', zoom)
        this.cameras.main.startFollow(this.player)
        var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        
        // borders
        this.matter.add.sprite(69 * zoom, 52 * zoom).setRectangle(128 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(5 * zoom, 101 * zoom).setRectangle(1 * zoom, 96 * zoom).setStatic(true)
        this.matter.add.sprite(21 * zoom, 149 * zoom).setRectangle(32 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(37 * zoom, 157 * zoom).setRectangle(1 * zoom, 16 * zoom).setStatic(true)
        this.matter.add.sprite(53 * zoom, 165 * zoom).setRectangle(32 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(69 * zoom, 157 * zoom).setRectangle(1 * zoom, 16 * zoom).setStatic(true)
        this.matter.add.sprite(101 * zoom, 149 * zoom).setRectangle(64 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(133 * zoom, 101 * zoom).setRectangle(1 * zoom, 96 * zoom).setStatic(true)

        // background objects
        this.cameras.main.setBackgroundColor('#060217')
        this.add.image(0, 0, 'towerRoomBackground').setScale(zoom).setOrigin(0, 0)
        this.add.image(41 * zoom, 22 * zoom, 'torch', 0).setScale(zoom).setOrigin(0, 0)
        this.add.image(91 * zoom, 22 * zoom, 'torch', 0).setScale(zoom).setOrigin(0, 0)

        // foreground objects
        var portal = new Object(this, 48, 9, 'portal', zoom)
        var bookshelf1 = new Object(this, 7, 15, 'bookshelf', zoom) // make interactable in future?
        var bookshelf2 = new Object(this, 99, 15, 'bookshelf', zoom)
        Object.objectList.forEach((object) => {
            object.setOverlap(this.player)
        })

        var circle = new Object(this, 37, 72, 'circle', zoom)
        circle.makeSensor()

        // characters
        var gladys = new Object(this, 110, 90, 'gladys', zoom)

        // dialogue and instructions
        var textBox = new TextBox(this, zoom)

        // object engagement
        var back = this.add.image(50, 50, 'buttons', 0).setScrollFactor(0, 0).setScale(zoom).setInteractive({ cursor: 'pointer' }).setDepth(20)
        back.on('pointerup', () => {
            music.destroy()
            this.scene.start('Middletown')
        })
        portal.setInstructions(this.player, textBox, () => {
            music.destroy()
            this.scene.start('Labyrinth')
        })
        var gladysIndex = -1
        var gladysDialogue = [
            "Welcome, you must be my new protege! My name is Gladys, and I will be your instructor for the year.",
            "As a student of the Dark Tower, and a budding Alchemist, you are tasked with traveling into the Labyrinth to defeat monsters and keep them from entering our world.",
            "Of course, since you're so young, you'll have Kyle to guide you until you can fight on your own.",
            "Let's commence your first mission!"
        ]
        const styleHelp = {
            fontSize: '18px',
            color: 'white',
            fontFamily: 'Calibri'
        }
        gladys.setInstructions(this.player, textBox, () => {
            textBox.setDialogueVisible(true)
            if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
                if (gladysIndex + 1 < gladysDialogue.length) {
                    gladysIndex++
                }
                if (gladysIndex + 1 == gladysDialogue.length) {
                    var helpBox = this.add.rectangle(this.cameras.main.displayWidth / 2, 75, 500, 50, 0x000000).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setDepth(20)
                    var helpText = this.add.text(this.cameras.main.displayWidth / 2, 75, 'Enter the Labyrinth through the portal.', styleHelp).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setDepth(20)
                }
            }
            textBox.on('pointerup', () => {
                if (gladysIndex - 1 >= 0) {
                    gladysIndex--
                }
                textBox.setDialogueText('Gladys, Elemental Alchemy Instructor', gladysDialogue[gladysIndex])
            })
            textBox.setDialogueText('Gladys, Elemental Alchemy Instructor', gladysDialogue[gladysIndex])
        })
    }
    update() {
        // player movement
        this.player.move()
    }
}

export default TowerInterior