import Phaser from 'phaser'
import Player from '../classes/player'
import Object from '../classes/object'
import TextBox from '../classes/textBox'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

class Middletown extends Phaser.Scene {
    constructor() {
        super({ key: 'Middletown' })
    }
    preload() {
        this.load.image('middletownBackground', '/assets/middletownBackground.png')
        this.load.image('tree', '/assets/tree.png')
        this.load.image('fountain', '/assets/fountain.png')
        this.load.image('bulletin', '/assets/bulletin.png')
        this.load.image('tower', '/assets/tower.png')
        this.load.image('forge', '/assets/forge.png')
        this.load.image('player', '/assets/player.png')
        this.load.spritesheet('sign', '/assets/sign.png', {
            frameWidth: 26,
            frameHeight: 24
        })
        this.load.image('spaceKey', '/assets/spaceKey.png')
        this.load.image('kyle', '/assets/characters/kyle.png')
        this.load.spritesheet('buttons', 'assets/util/buttons.png', {
            frameWidth: 11,
            frameHeight: 11
        })
        this.load.audio('middletownMusic', ['/musicSound/middletownMusic.mp3'])
    }
    create() {
        var music = this.sound.add('middletownMusic', {
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
        this.player = new Player(this, 100, 260, 'player', zoom)
        var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.cameras.main.startFollow(this.player)

        // background objects
        this.add.image(0, 0, 'middletownBackground').setScale(zoom).setOrigin(0, 0) // two missing pixels by tower
        new Object(this, 25, 320, 'tree', zoom)
        new Object(this, 20, 203, 'tree', zoom)
        new Object(this, 236, 224, 'tree', zoom)
        new Object(this, 340, 272, 'tree', zoom)
        new Object(this, 45, -16, 'tree', zoom)
        new Object(this, 126, -16, 'tree', zoom)

        // borders
        this.matter.add.sprite(104 * zoom, 16 * zoom).setRectangle(112 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(48 * zoom, 64 * zoom).setRectangle(1 * zoom, 96 * zoom).setStatic(true)
        this.matter.add.sprite(64 * zoom, 112 * zoom).setRectangle(32 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(80 * zoom, 160 * zoom).setRectangle(1 * zoom, 96 * zoom).setStatic(true)
        this.matter.add.sprite(56 * zoom, 207 * zoom).setRectangle(48 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(32 * zoom, 223 * zoom).setRectangle(1 * zoom, 32 * zoom).setStatic(true)
        this.matter.add.sprite(24 * zoom, 239 * zoom).setRectangle(16 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(16 * zoom, 311 * zoom).setRectangle(1 * zoom, 144 * zoom).setStatic(true)
        this.matter.add.sprite(104 * zoom, 383 * zoom).setRectangle(176 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(192 * zoom, 374 * zoom).setRectangle(1 * zoom, 16 * zoom).setStatic(true)
        this.matter.add.sprite(208 * zoom, 367 * zoom).setRectangle(32 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(224 * zoom, 352 * zoom).setRectangle(1 * zoom, 32 * zoom).setStatic(true)
        this.matter.add.sprite(304 * zoom, 335 * zoom).setRectangle(160 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(384 * zoom, 296 * zoom).setRectangle(1 * zoom, 80 * zoom).setStatic(true)
        this.matter.add.sprite(408 * zoom, 255 * zoom).setRectangle(48 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(432 * zoom, 200 * zoom).setRectangle(1 * zoom, 112 * zoom).setStatic(true)
        this.matter.add.sprite(424 * zoom, 144 * zoom).setRectangle(16 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(416 * zoom, 136 * zoom).setRectangle(1 * zoom, 16 * zoom).setStatic(true)
        this.matter.add.sprite(312 * zoom, 128 * zoom).setRectangle(208 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(208 * zoom, 160 * zoom).setRectangle(1 * zoom, 64 * zoom).setStatic(true)
        this.matter.add.sprite(168 * zoom, 192 * zoom).setRectangle(80 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(128 * zoom, 152 * zoom).setRectangle(1 * zoom, 80 * zoom).setStatic(true)
        this.matter.add.sprite(144 * zoom, 112 * zoom).setRectangle(32 * zoom, 1 * zoom).setStatic(true)
        this.matter.add.sprite(160 * zoom, 64 * zoom).setRectangle(1 * zoom, 96 * zoom).setStatic(true)

        // foreground objects
        var fountain = new Object(this, 82, 241, 'fountain', zoom)
        var tower = new Object(this, 74, -52, 'tower', zoom)
        var forge = new Object(this, 240, 119, 'forge', zoom)
        var bulletin = new Object(this, 128, 320, 'bulletin', zoom)
        var towerSign = new Object(this, 116, 200, 'sign', zoom, 2)
        var forgeSign = new Object(this, 179, 262, 'sign', zoom, 0)

        // characters
        var kyle = new Object(this, 106, 334, 'kyle', zoom)

        // dialogue and instructions
        var textBox = new TextBox(this, zoom)
        const styleHelp = {
            fontSize: '18px',
            color: 'white',
            fontFamily: 'Calibri'
        }
        var helpBox = this.add.rectangle(this.cameras.main.displayWidth / 2, 75, 500, 50, 0x000000).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setDepth(20)
        var helpText = this.add.text(this.cameras.main.displayWidth / 2, 75, 'Talk to Kyle to begin your adventure!', styleHelp).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setDepth(20)

        // object engagement
        tower.setInstructions(this.player, textBox, () => {
            music.destroy()
            this.scene.start('TowerInterior')
        })
        var kyleIndex = -1
        var kyleDialogue = [
            "Hey, you're the new kid aren't you? Professor Gladys' new student?",
            "I'm Kyle, a third year in the Dark Tower. I'll be showing you around. I'm busy so you'll be on your own a lot.",
            "If you want to get started, meet Professor Gladys at the Dark Tower. It's north of the fountain, so I'm sure you'll have no trouble finding it."
        ]
        kyle.setInstructions(this.player, textBox, () => {
            textBox.setDialogueVisible(true)
            if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
                if (kyleIndex + 1 < kyleDialogue.length) {
                    kyleIndex++
                }
                if (kyleIndex + 1 == kyleDialogue.length) {
                    helpText.setText("Head to the Dark Tower to see what's next!")
                }
            }
            textBox.on('pointerup', () => {
                if (kyleIndex - 1 >= 0) {
                    kyleIndex--
                }
                textBox.setDialogueText('Kyle, Third Year Student of the Dark Tower', kyleDialogue[kyleIndex])
            })
            textBox.setDialogueText('Kyle, Third Year Student of the Dark Tower', kyleDialogue[kyleIndex])
        })
        Object.objectList.forEach((object) => {
            object.setOverlap(this.player)
        })
    }
    update() {
        // player movement
        this.player.move()
    }
}

export default Middletown