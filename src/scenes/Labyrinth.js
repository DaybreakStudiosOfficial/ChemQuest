import Phaser from 'phaser'
import Player from '../classes/player'
import Object from '../classes/object'
import TextBox from '../classes/textBox'
import GenerateRoom from '../classes/generateRoom'
import tiles from '../tileMapping/labyrinthMapping'
import { floor, random } from 'mathjs'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

class Labyrinth extends Phaser.Scene {
    constructor() {
        super({ key: 'Labyrinth' })
    }
    preload() {
        this.load.image('labyrinthTiles', '/assets/tilesets/labyrinthTileset.png')
        this.load.image('player', '/assets/player.png')
        this.load.image('statue', '/assets/statue.png')
        this.load.image('monster', '/assets/monster.png')
        this.load.spritesheet('energy', '/assets/energy.png', {
            frameWidth: 9,
            frameHeight: 9
        })
        this.load.image('spaceKey', '/assets/spaceKey.png')
        this.load.image('kyle', '/assets/characters/kyle.png')
        this.load.image('chest', '/assets/chest.png')
        this.load.spritesheet('medal', '/assets/medal.png', {
            frameWidth: 17,
            frameHeight: 30
        })
        this.load.spritesheet('buttons', 'assets/util/buttons.png', {
            frameWidth: 11,
            frameHeight: 11
        })
        this.load.audio('labyrinthMusic', ['/musicSound/labyrinthMusic.mp3'])
        this.load.audio('playerBeam', ['/musicSound/playerBeamFX.wav'])
        this.load.audio('enemyBeam', ['/musicSound/enemyBeamFX.wav'])
    }
    create() {
        var music = this.sound.add('labyrinthMusic', {
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
        GenerateRoom.roomList = []
        GenerateRoom.monsterList = []
        GenerateRoom.monsterEnergyList = []
        GenerateRoom.complete = false

        this.cameras.main.setBackgroundColor('#08081A')
        const zoom = 4
        var energyBar = this.add.rectangle(this.cameras.main.displayWidth - 150, 50, 100, 32, 0x08081A).setScrollFactor(0, 0)
        energyBar.setOrigin(0, 0.5)
        const styleEnergy = {
            fontSize: '18px',
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'Calibri'
        }
        this.energyText = this.add.text(this.cameras.main.displayWidth - 120, 42, Player.energy, styleEnergy).setScrollFactor(0, 0)
        var energy = this.add.image(this.cameras.main.displayWidth - 150, 50, 'energy', 1).setScrollFactor(0, 0).setScale(zoom)
        this.energyText.setDepth(10)
        energy.setDepth(10)
        this.map = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            height: 200,
            width: 200,
        })
        this.tileset = this.map.addTilesetImage('labyrinthTiles')
        this.layer = this.map.createBlankLayer('main', this.tileset).setScale(zoom)

        const initialRoomX = this.map.width / 2
        const initialRoomY = this.map.height / 2
        const mainHeight = Math.floor(Math.random() * (GenerateRoom.roomMaxHeight - GenerateRoom.roomMinHeight + 1) + GenerateRoom.roomMinHeight)
        this.mainRoom = new GenerateRoom(this, zoom, tiles, this.layer, initialRoomX, initialRoomY, mainHeight)

        // initialize player
        this.player = new Player(this, this.mainRoom.getPlayerInitial()[0] * 4, this.mainRoom.getPlayerInitial()[1] * 4, 'player', zoom)
        this.player.showHealth()
        this.cameras.main.startFollow(this.player)

        this.mainRoom.setSprites(-1, this.player)

        // generate new rooms
        this.mainRoom.newRoom(this.mainRoom.getPosition()[0], this.mainRoom.getPosition()[1], this.mainRoom.getDimensions()[0])
        this.mainRoom.setSprites(0, this.player)

        var maxRooms = 4
        for (let i = 1; i < maxRooms; i++) {
            if (i == maxRooms - 1) {
                this.mainRoom.newRoom(GenerateRoom.roomList[i-1].roomX, GenerateRoom.roomList[i-1].roomY, GenerateRoom.roomList[i-1].roomWidth, true)
            } else {
                this.mainRoom.newRoom(GenerateRoom.roomList[i-1].roomX, GenerateRoom.roomList[i-1].roomY, GenerateRoom.roomList[i-1].roomWidth, false)
            }
            this.mainRoom.setSprites(i, this.player)
        }

        // object engagement
        Object.objectList.forEach((object) => {
            object.setOverlap(this.player)
        })
        var back = this.add.image(50, 50, 'buttons', 0).setScrollFactor(0, 0).setScale(zoom).setInteractive({ cursor: 'pointer' }).setDepth(20)
        back.on('pointerup', () => {
            music.destroy()
            this.scene.start('TowerInterior')
        })
    }
    update() {
        // player movement
        this.player.move()
        this.player.setAttack()
        this.player.updateEnergy()

        // object movement
        this.mainRoom.updateMonster(this.player.getPosition()[0], this.player.getPosition()[1])
        this.mainRoom.updateMonsterEnergy()

        this.energyText.setText(Player.energy)
    }
}

export default Labyrinth