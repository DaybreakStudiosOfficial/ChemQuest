import Object from '../classes/object'
import TextBox from '../classes/textBox'
import { auth, database } from '../components/configFirebase'
import { collection, getDocs, updateDoc, getDoc, doc, increment } from 'firebase/firestore'

class GenerateRoom {
    static roomList = []
    static monsterList = []
    static monsterEnergyList = []
    static roomMinWidth = 1
    static roomMaxWidth = 3
    static roomMinHeight = 6
    static roomMaxHeight = 8
    static doorWidth = 3
    static wallHeight = 3
    static complete = false
    constructor(scene, zoom, tiles, mapLayer, roomX, roomY, height) {
        // initialize tile data
        this.tiles = tiles
        this.mapLayer = mapLayer
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.scene = scene
        this.zoom = zoom

        // initialize room data
        this.wallWidth = Math.floor(Math.random() * (GenerateRoom.roomMaxWidth - GenerateRoom.roomMinWidth + 1) + GenerateRoom.roomMinWidth)
        this.randomHeight = height
        this.roomWidth = GenerateRoom.doorWidth + this.wallWidth * 2 + 4
        this.roomHeight = GenerateRoom.wallHeight + this.randomHeight + 4
        this.roomX = roomX - this.wallWidth + 2
        this.roomY = roomY
        this.nextRoom = false

        // initialize room objects
        this.statue = null

        // render left wall
        mapLayer.putTileAt(tiles.edge.corner.topLeft, this.roomX, this.roomY)
        mapLayer.randomize(this.roomX, this.roomY + 1, 1, this.randomHeight + GenerateRoom.wallHeight, tiles.edge.left)
        mapLayer.putTileAt(tiles.edge.corner.bottomLeft, this.roomX, this.roomY + this.randomHeight + GenerateRoom.wallHeight + 1)
        for (let i = 0; i < this.wallWidth; i++) {
            let index = i % 2
            mapLayer.putTileAt(tiles.edge.top[index], this.roomX + 1 + i, this.roomY)
        }
        for (let i = 0; i < this.wallWidth; i++) {
            for (let j = 0; j < GenerateRoom.wallHeight; j++) {
                let index = i % 2
                mapLayer.putTileAt(tiles.wall.brick[index][j], this.roomX + i + 1, this.roomY + j + 1)
            }
        }
        for (let i = 0; i < GenerateRoom.wallHeight; i++) {
            mapLayer.putTileAt(tiles.wall.end.left[i], this.roomX + this.wallWidth + 1, this.roomY + i + 1)
        }

        // render hallway
        mapLayer.putTileAt(tiles.edge.turn.topLeft, this.roomX + this.wallWidth + 1, this.roomY)
        mapLayer.putTileAt(tiles.edge.turn.topRight, this.roomX + this.wallWidth + GenerateRoom.doorWidth + 2, roomY)
        mapLayer.randomize(this.roomX + this.wallWidth + 2, this.roomY, 1, GenerateRoom.wallHeight + 1, tiles.floor.left)
        mapLayer.weightedRandomize(tiles.floor.center, this.roomX + this.wallWidth + 3, this.roomY, GenerateRoom.doorWidth - 2, GenerateRoom.wallHeight + 2)
        mapLayer.randomize(this.roomX + this.wallWidth + GenerateRoom.doorWidth + 1, this.roomY, 1, GenerateRoom.wallHeight + 1, tiles.floor.right)

        // render right wall
        for (let i = 0; i < this.wallWidth; i++) {
            let index = i % 2
            mapLayer.putTileAt(tiles.edge.top[index], this.roomX + this.wallWidth + GenerateRoom.doorWidth + 3 + i, this.roomY)
        }
        mapLayer.putTileAt(tiles.edge.corner.topRight, this.roomX + (this.wallWidth * 2) + GenerateRoom.doorWidth + 3, this.roomY)
        mapLayer.randomize(this.roomX + (this.wallWidth * 2) + GenerateRoom.doorWidth + 3, roomY + 1, 1, this.randomHeight + GenerateRoom.wallHeight, tiles.edge.right)
        mapLayer.putTileAt(tiles.edge.corner.bottomRight, this.roomX + (this.wallWidth * 2) + GenerateRoom.doorWidth + 3, this.roomY + this.randomHeight + GenerateRoom.wallHeight + 1)
        for (let i = 0; i < this.wallWidth; i++) {
            for (let j = 0; j < GenerateRoom.wallHeight; j++) {
                let index = i % 2
                mapLayer.putTileAt(tiles.wall.brick[index][j], this.roomX + this.wallWidth + GenerateRoom.doorWidth + i + 3, this.roomY + j + 1)
            }
        }
        for (let i = 0; i < GenerateRoom.wallHeight; i++) {
            mapLayer.putTileAt(tiles.wall.end.right[i], this.roomX + this.wallWidth + GenerateRoom.doorWidth + 2, this.roomY + i + 1)
        }

        // render bottom wall
        for (let i = 0; i <= this.wallWidth * 2 + GenerateRoom.doorWidth + 1; i++) {
            let index = i % 2
            mapLayer.putTileAt(tiles.edge.bottom[index], this.roomX + 1 + i, this.roomY + this.randomHeight + GenerateRoom.wallHeight + 1)
        }

        // floor
        mapLayer.randomize(this.roomX + 2, this.roomY + GenerateRoom.wallHeight + 1, this.wallWidth, 1, tiles.floor.top)
        mapLayer.randomize(this.roomX + this.wallWidth + GenerateRoom.doorWidth + 2, this.roomY + GenerateRoom.wallHeight + 1, this.wallWidth, 1, tiles.floor.top)
        mapLayer.putTileAt(tiles.floor.corner.left, this.roomX + 1, this.roomY + GenerateRoom.wallHeight + 1)
        mapLayer.randomize(this.roomX + 1, this.roomY + GenerateRoom.wallHeight + 2, 1, this.randomHeight - 1, tiles.floor.left)
        mapLayer.putTileAt(tiles.floor.corner.right, this.roomX + (this.wallWidth * 2) + GenerateRoom.doorWidth + 2, this.roomY + GenerateRoom.wallHeight + 1)
        mapLayer.randomize(this.roomX + (this.wallWidth * 2) + GenerateRoom.doorWidth + 2, this.roomY + GenerateRoom.wallHeight + 2, 1, this.randomHeight - 1, tiles.floor.right)
        mapLayer.putTileAt(tiles.floor.turn.left, this.roomX + this.wallWidth + 2, this.roomY + GenerateRoom.wallHeight + 1)
        mapLayer.putTileAt(tiles.floor.turn.right, this.roomX + this.wallWidth + GenerateRoom.doorWidth + 1, this.roomY + GenerateRoom.wallHeight + 1)
        mapLayer.weightedRandomize(tiles.floor.center, this.roomX + 2, this.roomY + GenerateRoom.wallHeight + 2, this.wallWidth * 2 + GenerateRoom.doorWidth, this.randomHeight - 1)

        // set collision
        mapLayer.setCollision(tiles.collision, true)
        scene.matter.world.convertTilemapLayer(mapLayer)
    }
    getPlayerInitial() {
        return [(this.roomX + 0.5) * this.zoom, (this.roomY + this.randomHeight - 3.5) * this.zoom]
    }
    getPosition() {
        return [this.roomX, this.roomY]
    }
    getDimensions() {
        return [this.roomWidth, this.roomHeight]
    }
    newRoom(prevX, prevY, prevWidth, last) {
        const nextHeight = Math.floor(Math.random() * (GenerateRoom.roomMaxHeight - GenerateRoom.roomMinHeight + 1) + GenerateRoom.roomMinHeight)
        var wallWidth = Math.floor(Math.random() * (GenerateRoom.roomMaxWidth - GenerateRoom.roomMinWidth + 1) + GenerateRoom.roomMinWidth)
        var roomWidth = GenerateRoom.doorWidth + wallWidth * 2 + 4
        var roomHeight = GenerateRoom.wallHeight + nextHeight + 4
        var nextRoomX = prevX + ((prevWidth - roomWidth) / 2)
        var nextRoomY = prevY - nextHeight - 5
        this.nextRoomX = nextRoomX
        this.nextRoomY = nextRoomY

        this.mapLayer.putTileAt(this.tiles.edge.corner.topLeft, nextRoomX, nextRoomY)
        this.mapLayer.randomize(nextRoomX, nextRoomY + 1, 1, nextHeight + GenerateRoom.wallHeight, this.tiles.edge.left)
        this.mapLayer.putTileAt(this.tiles.edge.corner.bottomLeft, nextRoomX, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1)
        this.mapLayer.putTileAt(this.tiles.edge.corner.topRight, nextRoomX + (wallWidth * 2) + GenerateRoom.doorWidth + 3, nextRoomY)
        this.mapLayer.randomize(nextRoomX + (wallWidth * 2) + GenerateRoom.doorWidth + 3, nextRoomY + 1, 1, nextHeight + GenerateRoom.wallHeight, this.tiles.edge.right)
        this.mapLayer.putTileAt(this.tiles.edge.corner.bottomRight, nextRoomX + (wallWidth * 2) + GenerateRoom.doorWidth + 3, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1)

        if (last) {
            for (let i = 0; i < roomWidth - 2; i++) {
                let index = i % 2
                this.mapLayer.putTileAt(this.tiles.edge.top[index], nextRoomX + 1 + i, nextRoomY)
            }
            for (let i = 0; i < roomWidth - 2; i++) {
                for (let j = 0; j < GenerateRoom.wallHeight; j++) {
                    let index = i % 2
                    this.mapLayer.putTileAt(this.tiles.wall.brick[index][j], nextRoomX + i + 1, nextRoomY + j + 1)
                }
            }
            this.mapLayer.randomize(nextRoomX + 2, nextRoomY + GenerateRoom.wallHeight + 1, roomWidth - 4, 1, this.tiles.floor.top)
        } else {
            // render left wall
            for (let i = 0; i < wallWidth; i++) {
                let index = i % 2
                this.mapLayer.putTileAt(this.tiles.edge.top[index], nextRoomX + 1 + i, nextRoomY)
            }
            for (let i = 0; i < wallWidth; i++) {
                for (let j = 0; j < GenerateRoom.wallHeight; j++) {
                    let index = i % 2
                    this.mapLayer.putTileAt(this.tiles.wall.brick[index][j], nextRoomX + i + 1, nextRoomY + j + 1)
                }
            }
            for (let i = 0; i < GenerateRoom.wallHeight; i++) {
                this.mapLayer.putTileAt(this.tiles.wall.end.left[i], nextRoomX + wallWidth + 1, nextRoomY + i + 1)
            }

            // render hallway
            this.mapLayer.putTileAt(this.tiles.edge.turn.topLeft, nextRoomX + wallWidth + 1, nextRoomY)
            this.mapLayer.putTileAt(this.tiles.edge.turn.topRight, nextRoomX + wallWidth + GenerateRoom.doorWidth + 2, nextRoomY)
            this.mapLayer.randomize(nextRoomX + wallWidth + 2, nextRoomY, 1, GenerateRoom.wallHeight + 1, this.tiles.floor.left)
            this.mapLayer.weightedRandomize(this.tiles.floor.center, nextRoomX + wallWidth + 3, nextRoomY, GenerateRoom.doorWidth - 2, GenerateRoom.wallHeight + 2)
            this.mapLayer.randomize(nextRoomX + wallWidth + GenerateRoom.doorWidth + 1, nextRoomY, 1, GenerateRoom.wallHeight + 1, this.tiles.floor.right)

            // render right wall
            for (let i = 0; i < wallWidth; i++) {
                let index = i % 2
                this.mapLayer.putTileAt(this.tiles.edge.top[index], nextRoomX + wallWidth + GenerateRoom.doorWidth + 3 + i, nextRoomY)
            }
            for (let i = 0; i < wallWidth; i++) {
                for (let j = 0; j < GenerateRoom.wallHeight; j++) {
                    let index = i % 2
                    this.mapLayer.putTileAt(this.tiles.wall.brick[index][j], nextRoomX + wallWidth + GenerateRoom.doorWidth + i + 3, nextRoomY + j + 1)
                }
            }
            for (let i = 0; i < GenerateRoom.wallHeight; i++) {
                this.mapLayer.putTileAt(this.tiles.wall.end.right[i], nextRoomX + wallWidth + GenerateRoom.doorWidth + 2, nextRoomY + i + 1)
            }
            this.mapLayer.putTileAt(this.tiles.floor.turn.left, nextRoomX + wallWidth + 2, nextRoomY + GenerateRoom.wallHeight + 1)
            this.mapLayer.putTileAt(this.tiles.floor.turn.right, nextRoomX + wallWidth + GenerateRoom.doorWidth + 1, nextRoomY + GenerateRoom.wallHeight + 1)
        }

        // floor
        this.mapLayer.putTileAt(this.tiles.floor.corner.left, nextRoomX + 1, nextRoomY + GenerateRoom.wallHeight + 1)
        this.mapLayer.putTileAt(this.tiles.floor.corner.right, nextRoomX + (wallWidth * 2) + GenerateRoom.doorWidth + 2, nextRoomY + GenerateRoom.wallHeight + 1)
        this.mapLayer.randomize(nextRoomX + 2, nextRoomY + GenerateRoom.wallHeight + 1, wallWidth, 1, this.tiles.floor.top)
        this.mapLayer.randomize(nextRoomX + wallWidth + GenerateRoom.doorWidth + 2, nextRoomY + GenerateRoom.wallHeight + 1, wallWidth, 1, this.tiles.floor.top)
        this.mapLayer.randomize(nextRoomX + 1, nextRoomY + GenerateRoom.wallHeight + 2, 1, nextHeight - 1, this.tiles.floor.left)
        this.mapLayer.randomize(nextRoomX + (wallWidth * 2) + GenerateRoom.doorWidth + 2, nextRoomY + GenerateRoom.wallHeight + 2, 1, nextHeight - 1, this.tiles.floor.right)
        this.mapLayer.weightedRandomize(this.tiles.floor.center, nextRoomX + 2, nextRoomY + GenerateRoom.wallHeight + 2, wallWidth * 2 + GenerateRoom.doorWidth, nextHeight - 1)

        // render bottom wall
        for (let i = 0; i < wallWidth; i++) {
            let index = i % 2
            this.mapLayer.putTileAt(this.tiles.edge.bottom[index], nextRoomX + 1 + i, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1)
        }
        this.mapLayer.putTileAt(this.tiles.edge.turn.bottomLeft, nextRoomX + wallWidth + 1, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1)
        this.mapLayer.randomize(nextRoomX + wallWidth + 2, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1, 1, 1, this.tiles.floor.left)
        this.mapLayer.weightedRandomize(this.tiles.floor.center, nextRoomX + wallWidth + 3, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1, GenerateRoom.doorWidth - 2, 1)
        this.mapLayer.randomize(nextRoomX + wallWidth + GenerateRoom.doorWidth + 1, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1, 1, 1, this.tiles.floor.right)
        this.mapLayer.putTileAt(this.tiles.edge.turn.bottomRight, nextRoomX + wallWidth + GenerateRoom.doorWidth + 2, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1)
        for (let i = 0; i < wallWidth; i++) {
            let index = i % 2
            this.mapLayer.putTileAt(this.tiles.edge.bottom[index], nextRoomX + wallWidth + GenerateRoom.doorWidth + 3 + i, nextRoomY + nextHeight + GenerateRoom.wallHeight + 1)
        }

        // set collision
        this.mapLayer.setCollision(this.tiles.collision, true)
        this.scene.matter.world.convertTilemapLayer(this.mapLayer)

        const styleHelp = {
            fontSize: '18px',
            color: 'white',
            fontFamily: 'Calibri'
        }
        this.helpBox = this.scene.add.rectangle(this.scene.cameras.main.displayWidth / 2, 75, 500, 50, 0x000000).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setDepth(20)
        this.helpText = this.scene.add.text(this.scene.cameras.main.displayWidth / 2, 75, 'Talk to Kyle to receive your mission.', styleHelp).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setDepth(20)

        GenerateRoom.roomList.push({
            roomX: nextRoomX,
            roomY: nextRoomY,
            roomWidth: roomWidth,
            roomHeight: roomHeight
        })
    }
    async setSprites(index, player) {
        const docRef = doc(database, 'dynamic', 'currentUser')
        const docSnap = await getDoc(docRef)
        const userID = docSnap.data().UID
        if (index < 0) {
            var statueX = (this.roomX + this.wallWidth + 3) * this.zoom * 4
            var statueY = (this.roomY + this.randomHeight) * this.zoom * 4
            this.statue = new Object(this.scene, statueX, statueY, 'statue', this.zoom)
            var textBox = new TextBox(this.scene, this.zoom)
            this.statue.setInstructions(player, textBox, () => {
                this.scene.sound.removeAll()
                this.scene.scene.start('Quiz')
            })
            var kyleX = (this.roomX + this.wallWidth + 3 + 3) * this.zoom * 4
            var kyleY = (this.roomY + this.randomHeight - 1) * this.zoom * 4
            var kyle = new Object(this.scene, kyleX, kyleY, 'kyle', this.zoom)
            var kyleIndex = -1
            var kyleDialogue = [
                "Glad you're finally here. I'm sure Professor Gladys already explained our duty as Alchemists.",
                "This is your mission: defeat the monsters in a Labyrinth and retrieve the contents of the chest.",
                "But first, it looks like your energy is running low. Hit that statue, it's the sign of the Alchemist. Whenever you see it, you'll be able to recharge.",
                "Though, it does come at a price, of course."
            ]
            var kyleWinIndex = -1
            var kyleWinDialogue = [
                "Looks like you made it back in one piece, nice work. Now that you understand your duty, you hardly need my guidance.",
                "From here on out, you'll be fighting these monsters non-stop to protect those in our world.",
                "Are you ready?"
            ]
            kyle.setInstructions(player, textBox, () => {
                textBox.setDialogueVisible(true)
                if (GenerateRoom.complete) {
                    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                        if (kyleWinIndex + 1 < kyleWinDialogue.length) {
                            kyleWinIndex++
                        }
                        if (kyleWinIndex + 1 == kyleWinDialogue.length) {
                            this.scene.time.addEvent({
                                delay: 3000,
                                callback: () => {
                                    this.scene.scene.start('Labyrinth')
                                },
                                callbackScope: this
                            })
                        }
                    }
                    textBox.on('pointerup', () => {
                        if (kyleWinIndex - 1 >= 0) {
                            kyleWinIndex--
                        }
                        textBox.setDialogueText('Kyle, Third Year Student of the Dark Tower', kyleWinDialogue[kyleWinIndex])
                    })
                    textBox.setDialogueText('Kyle, Third Year Student of the Dark Tower', kyleWinDialogue[kyleWinIndex])
                } else {
                    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                        if (kyleIndex + 1 < kyleDialogue.length) {
                            kyleIndex++
                        }
                        if (kyleIndex + 1 == kyleDialogue.length) {
                            this.helpText.setText('Clear the Labyrinth and collect the chest.')
                        }
                    }
                    textBox.on('pointerup', () => {
                        if (kyleIndex - 1 >= 0) {
                            kyleIndex--
                        }
                        textBox.setDialogueText('Kyle, Third Year Student of the Dark Tower', kyleDialogue[kyleIndex])
                    })
                    textBox.setDialogueText('Kyle, Third Year Student of the Dark Tower', kyleDialogue[kyleIndex])
                }
            })
        } else {
            var roomHeight = GenerateRoom.roomList[index].roomHeight
            var minY = GenerateRoom.roomList[index].roomY
            var maxY = GenerateRoom.roomList[index].roomY + roomHeight - 9

            var roomX = GenerateRoom.roomList[index].roomX
            var roomY = Math.floor(Math.random() * (maxY - minY + 1) + minY)
            var roomY2 = Math.floor(Math.random() * (maxY - minY + 1) + minY)
            while (roomY == roomY2 || roomY + 1 == roomY2 || roomY - 1 == roomY2) {
                var roomY2 = Math.floor(Math.random() * (maxY - minY + 1) + minY)
            }

            // create first monster
            var hitRight = false
            var monsterX = (roomX + 1) * this.zoom * 4
            var monsterY = (roomY + 4) * this.zoom * 4
            var monster = new Object(this.scene, monsterX, monsterY, 'monster', this.zoom)
            var listIndex = GenerateRoom.monsterList.length
            GenerateRoom.monsterList.push([monster, hitRight, index, listIndex])
            monster.showHealth()

            // create second monster
            var monsterX2 = (roomX + this.roomWidth - 1.5) * this.zoom * 4
            var monsterY2 = (roomY2 + 4) * this.zoom * 4
            var monster2 = new Object(this.scene, monsterX2, monsterY2, 'monster', this.zoom)
            var listIndex2 = GenerateRoom.monsterList.length
            GenerateRoom.monsterList.push([monster2, hitRight, index, listIndex2])
            monster2.showHealth()

            // add two different timer events
            var energyPulse = 2000
            var enemyBeam = this.scene.sound.add('enemyBeam', {
                instances: 10
            })
            var timer = this.scene.time.addEvent({
                delay: energyPulse,
                callback: () => {
                    if (monster.health <= 0) {
                        this.scene.time.removeEvent(timer)
                    }
                    enemyBeam.play()
                    var energy = this.scene.matter.add.sprite(monster.x, monster.y, 'energy', 0).setScale(this.zoom)
                    GenerateRoom.monsterEnergyList.push(energy)
                    var energyIndex = GenerateRoom.monsterEnergyList.length - 1

                    const bodyId = energy.body.id
                    const playerId = player.body.id
                    this.scene.matter.world.on('collisionstart', function (event) {
                        if (event.pairs.some(pair => (pair.bodyA.id == bodyId && pair.bodyB.id == playerId) || (pair.bodyA.id == playerId && pair.bodyB.id == bodyId))) {
                            player.incrementHealth(10)
                            energy.destroy()
                            GenerateRoom.monsterEnergyList = GenerateRoom.monsterEnergyList.splice(energyIndex, 1) 
                        } else {
                            this.scene.time.addEvent({
                                delay: 1000,
                                callback: () => {
                                    energy.destroy()
                                    GenerateRoom.monsterEnergyList = GenerateRoom.monsterEnergyList.splice(energyIndex, 1)
                                }
                            })
                        }
                    })
                },
                loop: true
            })
            var timer2 = this.scene.time.addEvent({
                delay: energyPulse,
                callback: () => {
                    if (monster2.health <= 0) {
                        this.scene.time.removeEvent(timer2)
                    }
                    var energy2 = this.scene.matter.add.sprite(monster2.x, monster2.y, 'energy', 0).setScale(this.zoom)
                    GenerateRoom.monsterEnergyList.push(energy2)
                    var energyIndex2 = GenerateRoom.monsterEnergyList.length - 1

                    const bodyId2 = energy2.body.id
                    const playerId = player.body.id
                    this.scene.matter.world.on('collisionstart', function (event) {
                        if (event.pairs.some(pair => (pair.bodyA.id == bodyId2 && pair.bodyB.id == playerId) || (pair.bodyA.id == playerId && pair.bodyB.id == bodyId2))) {
                            player.incrementHealth(10)
                            energy2.destroy()
                            GenerateRoom.monsterEnergyList = GenerateRoom.monsterEnergyList.splice(energyIndex2, 1)
                        } else {
                            this.scene.time.addEvent({
                                delay: 1000,
                                callback: () => {
                                    energy2.destroy()
                                    GenerateRoom.monsterEnergyList = GenerateRoom.monsterEnergyList.splice(energyIndex2, 1)
                                }
                            })
                        }
                    })
                },
                loop: true
            })
        }
        if (index == 3) {
            var chestX = (this.nextRoomX + this.wallWidth + 3) * this.zoom * 4
            var chestY = (this.nextRoomY + this.randomHeight) * this.zoom * 4
            this.chest = new Object(this.scene, chestX, chestY, 'chest', this.zoom)
            const styleBig = {
                fontSize: '20px',
                color: 'white',
                fontFamily: 'Calibri'
            }
            const styleMedium = {
                fontSize: '18px',
                color: 'white',
                fontFamily: 'Calibri'
            }
            const styleSmall = {
                fontSize: '16px',
                color: 'white',
                fontFamily: 'Calibri'
            }
            var achievementsList = []
            const querySnapshot = await getDocs(collection(database, 'achievements'))
            querySnapshot.forEach((doc) => {
                var fixedId = doc.id.replaceAll('-', ' ')
                achievementsList.push({
                    TITLE: fixedId,
                    DESCRIPTION: doc.data().DESCRIPTION
                })
            })
            var userType = 'users'
            const tempRef = doc(database, 'students', userID)
            const tempSnap = await getDoc(tempRef)
            if (tempSnap.data()) {
                userType = 'students'
            } else {
                const docRef2 = doc(database, 'educators', userID)
                const docSnap2 = await getDoc(docRef2)
                if (docSnap2.data()) {
                    userType = 'educators'
                }
            }
            const docRef = doc(database, userType, userID)
            const docSnap = await getDoc(docRef)
            var textBox = new TextBox(this.scene, this.zoom)
            textBox.visible = false
            var notif = this.scene.add.rectangle((this.scene.cameras.main.displayWidth / 2) - 150, (this.scene.cameras.main.displayHeight / 2) - 150, 300, 300, 0x000000).setOrigin(0, 0).setScrollFactor(0, 0).setDepth(20)
            notif.visible = false
            let randInt = Math.floor(Math.random() * 2)
            var medal = this.scene.add.image(this.scene.cameras.main.displayWidth / 2, (this.scene.cameras.main.displayHeight / 2) - 110, 'medal', randInt).setScale(this.zoom).setInteractive({ cursor: 'pointer' }).setOrigin(0.5, 0).setScrollFactor(0, 0).setDepth(20)
            medal.visible = false
            var achievement
            var description
            if (docSnap.data().PASSES == 0) {
                achievement = 'Getting Started'
                description = 'Completed one Labyrinth pass.'
            } else {
                achievement = achievementsList[Math.floor(Math.random() * achievementsList.length)].TITLE
                description = achievementsList[Math.floor(Math.random() * achievementsList.length)].DESCRIPTION
            }
            var text1 = this.scene.add.text(this.scene.cameras.main.displayWidth / 2, (this.scene.cameras.main.displayHeight / 2) + 30, 'Achievement unlocked!', styleBig).setOrigin(0.5, 0).setScrollFactor(0, 0).setDepth(20)
            text1.visible = false
            var text2 = this.scene.add.text(this.scene.cameras.main.displayWidth / 2, (this.scene.cameras.main.displayHeight / 2) + 60, achievement, styleMedium).setScrollFactor(0, 0).setOrigin(0.5, 0).setDepth(20)
            var text3 = this.scene.add.text(this.scene.cameras.main.displayWidth / 2, (this.scene.cameras.main.displayHeight / 2) + 90, description, styleSmall).setScrollFactor(0, 0).setOrigin(0.5, 0).setDepth(20)
            text2.visible = false
            text3.visible = false
            var exit = this.scene.add.image((this.scene.cameras.main.displayWidth / 2) + 125, (this.scene.cameras.main.displayHeight / 2) - 116, 'buttons', 2).setScrollFactor(0, 0).setScale(this.zoom).setInteractive({ cursor: 'pointer' }).setDepth(20)
            exit.visible = false
            exit.on('pointerup', () => {
                notif.visible = false
                medal.visible = false
                text1.visible = false
                text2.visible = false
                text3.visible = false
                exit.visible = false
            })
            this.chest.setInstructions(player, textBox, () => {
                notif.visible = true
                medal.visible = true
                text1.visible = true
                text2.visible = true
                text3.visible = true
                exit.visible = true
                if (!GenerateRoom.complete) {
                    const updatePasses = async () => {
                        const docRef = doc(database, userType, userID)
                        await updateDoc(docRef, {
                            PASSES: increment(1)
                        })
                    }
                    updatePasses()
                }
                GenerateRoom.complete = true
            })
        }
    }
    updateMonster(targetX, targetY) {
        GenerateRoom.monsterList.forEach((monsterObject) => {
            if (monsterObject[0].visible) {
                var monster = monsterObject[0]
                var hitRight = monsterObject[1]
                var roomIndex = monsterObject[2]

                var roomX = GenerateRoom.roomList[roomIndex].roomX
                var roomY = GenerateRoom.roomList[roomIndex].roomY
                var roomWidth = GenerateRoom.roomList[roomIndex].roomWidth

                var monsterSpeed = 1 * this.zoom
                var maxX = (roomX + roomWidth - 1.5) * this.zoom * 16
                var minX = (roomX + 1.5) * this.zoom * 16

                if (!hitRight && monster.x < maxX) {
                    monster.incrementX(monsterSpeed)
                } 
                if (monster.x + monster.width >= maxX) {
                    monsterObject[1] = true
                }
                if (hitRight && monster.x > minX) {
                    monster.incrementX(-monsterSpeed)
                }
                if (monster.x <= minX) {
                    monsterObject[1] = false
                }
            }
        })
    }
    updateMonsterEnergy() {
        GenerateRoom.monsterEnergyList.forEach((monsterEnergy) => {
            if (monsterEnergy.active) {
                var energySpeed = 1 * this.zoom
                monsterEnergy.y += energySpeed
            }
        })
    }
}

export default GenerateRoom
