import GenerateRoom from '../classes/generateRoom'
class Player extends Phaser.Physics.Matter.Sprite {
    static energyList = []
    static energy = 0
    static kyleChatCount = 0
    constructor(scene, x, y, texture, zoom) {
        super(scene.matter.world, x, y, texture).setScale(zoom).setDepth(2)
        this.x = (x + (this.displayWidth / 2)) * zoom
        this.y = (y + ((this.displayHeight / 2) * 2)) * zoom
        this.body.id = 'player'
        this.health = 100
        this.maxHealth = 100

        // adjust hitbox
        this.setRectangle(this.displayWidth, this.displayHeight / 2)
        this.setOrigin(0.5, 0.75)

        this.arrowKeys = scene.input.keyboard.createCursorKeys()
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.spaceKey.setEmitOnRepeat(false)
        this.speed = 2 * zoom
        this.zoom = zoom

        scene.add.existing(this)
    }
    move() {
        if (this.arrowKeys.up.isDown) {
            this.y -= this.speed
        } else if (this.arrowKeys.down.isDown) {
            this.y += this.speed
        } else if (this.arrowKeys.left.isDown) {
            this.x -= this.speed
        } else if (this.arrowKeys.right.isDown) {
            this.x += this.speed
        }
    }
    getPosition() {
        return [this.x, this.y]
    }
    showHealth() {
        var barX = this.scene.cameras.main.centerX - 28
        var barY = this.scene.cameras.main.centerY - 84
        this.bar = this.scene.add.rectangle(barX, barY, 56, 8, 0xFF0000).setDepth(4).setScrollFactor(0, 0)
        this.bar.setOrigin(0, 0)

        this.healthBar = this.scene.add.rectangle(barX, barY, 56, 8, 0x00FF00).setDepth(4).setScrollFactor(0, 0)
        this.healthBar.setScale(this.health / this.maxHealth, 1)
        this.healthBar.setOrigin(0, 0)

        this.scene.add.existing(this.bar)
        this.scene.add.existing(this.healthBar)
    }
    setHealth(health) {
        if (health < 0) {
            health = 0
        }
        this.health = health
        this.healthBar.setScale(this.health / this.maxHealth, 1)
    }
    incrementHealth(increment) {
        if (this.health - increment <= 0) {
            this.health = 0
        } else {
            this.health -= increment
        }
        this.healthBar.setScale(this.health / this.maxHealth, 1)
        if (this.health <= 0) {
            this.gameOver()
        }
    }
    gameOver() {
        var backgroundWidth = this.scene.cameras.main.displayWidth
        var backgroundHeight = this.scene.cameras.main.displayHeight
        var background = this.scene.add.rectangle(0, 0, backgroundWidth, backgroundHeight, 0x000000).setDepth(10)
        background.setScrollFactor(0, 0)
        background.setOrigin(0, 0)

        const styleText = {
            fontSize: '42px',
            color: 'white',
            fontFamily: 'Calibri'
        }
        const styleSmaller = {
            fontSize: '32px',
            color: 'white',
            fontFamily: 'Calibri'
        }
        var textX = this.scene.cameras.main.centerX
        var textY = this.scene.cameras.main.centerY
        var text1 = this.scene.add.text(textX, textY - 50, 'Game over!', styleText).setScrollFactor(0, 0).setDepth(10).setOrigin(0.5, 0)
        var text2 = this.scene.add.text(textX, textY + 10, 'Try completing the dungeon again.', styleSmaller).setScrollFactor(0, 0).setDepth(10).setOrigin(0.5, 0)

        var exit = this.scene.add.image(50, 50, 'buttons', 1).setScrollFactor(0, 0).setScale(this.zoom).setInteractive({ cursor: 'pointer' }).setDepth(20)
        exit.on('pointerup', () => {
            this.scene.scene.start('Labyrinth')
        })

        this.scene.paused = true
    }
    setAttack() {
        var playerBeam = this.scene.sound.add('playerBeam')
        if (Player.energy > 3 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            Player.energy = Player.energy - 3
            enemyBeam.play()
            if (this.arrowKeys.down.isDown) {
                var direction = 1
                var energy = this.scene.matter.add.sprite(this.x, this.y + 48, 'energy', 1).setScale(this.zoom)
            } else {
                var direction = -1
                var energy = this.scene.matter.add.sprite(this.x, this.y - 96, 'energy', 1).setScale(this.zoom)
            }
            Player.energyList.push([energy, direction])
            var energyIndex = Player.energyList.length - 1
            var energyId = energy.body.id
            this.scene.matter.world.on('collisionstart', function (event) {
                GenerateRoom.monsterList.forEach((monster) => {
                    if (monster[0].body) {
                        var monsterId = monster[0].body.id
                        if (event.pairs.some(pair => (pair.bodyA.id == monsterId && pair.bodyB.id == energyId) || (pair.bodyA.id == energyId && pair.bodyB.id == monsterId))) {
                            Player.energyList = Player.energyList.splice(energyIndex, 1)
                            energy.destroy()
                            monster[0].incrementHealth(25)
                            if (monster[0].health <= 0) {
                                monster[0].hideObject()
                            }
                        } else {
                            this.scene.time.addEvent({
                                delay: 1500,
                                callback: () => {
                                    Player.energyList = Player.energyList.splice(energyIndex, 1)
                                    energy.destroy()
                                }
                            })
                        }
                    }
                })
            })
        }
    }
    updateEnergy() {
        Player.energyList.forEach((energy) => {
            if (energy[0].active) {
                var energySpeed = 4 * this.zoom * energy[1]
                energy[0].y += energySpeed
            }
        })
    }
}

export default Player