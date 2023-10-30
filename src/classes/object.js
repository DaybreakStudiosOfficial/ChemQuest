class Object extends Phaser.Physics.Matter.Sprite {
    static objectList = []
    constructor(scene, x, y, texture, zoom, frame = null) {
        super(scene.matter.world, x, y, texture, frame)
        this.x = (x + (this.displayWidth / 2)) * zoom
        this.y = (y + ((this.displayHeight / 2) * 1.5)) * zoom
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.engageFunction = null
        this.scene = scene
        this.health = 100
        this.maxHealth = 100
        this.setCrop()
        this.setDepth(1)
        Object.objectList.push(this)

        // adjust hitbox
        this.setScale(zoom)
        this.setRectangle(this.displayWidth, this.displayHeight / 2)
        this.setOrigin(0.5, 0.75)
        this.setStatic(true)

        // adjust overlap
        this.overlap = scene.matter.add.image(this.x, this.y - (this.displayHeight / 2))
        this.overlap.setRectangle(this.displayWidth, this.displayHeight / 2)
        this.overlap.setOrigin(0, 0)
        this.overlap.setStatic(true)
        this.overlap.setSensor(true)

        scene.add.existing(this)
    }
    makeSensor() {
        this.setSensor(true)
    }
    setOverlap(object) {
        var overlapBody = this.overlap.body.id
        var thisSprite = this
        this.scene.matter.world.on('collisionactive', function (event) {
            if (event.pairs.some(pair => (pair.bodyA.id == overlapBody && pair.bodyB.id == object.body.id) || (pair.bodyA.id == object.body.id && pair.bodyB.id == overlapBody))) {
                thisSprite.setDepth(3)
            }
        })
        this.scene.matter.world.on('collisionend', function (event) {
            if (event.pairs.some(pair => (pair.bodyA.id == overlapBody && pair.bodyB.id == object.body.id) || (pair.bodyA.id == object.body.id && pair.bodyB.id == overlapBody))) {
                thisSprite.setDepth(1)
            }
        })
    }
    setInstructions(object, textBox, callBack) {
        const overlapBody = this.overlap.body.id
        const collideBody = this.body.id
        const objectBodyId = object.body.id
        const space = this.spaceKey
        this.scene.matter.world.on('collisionactive', function (event) {
            if (event.pairs.some(pair => (pair.bodyA.id == overlapBody && pair.bodyB.id == objectBodyId) || (pair.bodyA.id == objectBodyId && pair.bodyB.id == overlapBody) || (pair.bodyA.id == collideBody && pair.bodyB.id == objectBodyId) || (pair.bodyA.id == objectBodyId && pair.bodyB.id == collideBody))) {
                textBox.setInstructionsVisible(true)
                if (space.isDown) {
                    callBack()
                }
            }
        })
        this.scene.matter.world.on('collisionend', function (event) {
            if (event.pairs.some(pair => (pair.bodyA.id == overlapBody && pair.bodyB.id == objectBodyId) || (pair.bodyA.id == objectBodyId && pair.bodyB.id == overlapBody) || (pair.bodyA.id == collideBody && pair.bodyB.id == objectBodyId) || (pair.bodyA.id == objectBodyId && pair.bodyB.id == collideBody))) {
                textBox.setInstructionsVisible(false)
                if (space.isDown) {
                    callBack()
                }
            }
        })
    }
    setCollide(callBack, object) {
        const overlapBody = this.overlap.body.id
        const collideBody = this.body.id
        const objectBodyId = object.body.id
        this.scene.matter.world.on('collisionstart', function (event) {
            if (event.pairs.some(pair => (pair.bodyA.id == overlapBody && pair.bodyB.id == objectBodyId) || (pair.bodyA.id == objectBodyId && pair.bodyB.id == overlapBody) || (pair.bodyA.id == collideBody && pair.bodyB.id == objectBodyId) || (pair.bodyA.id == objectBodyId && pair.bodyB.id == collideBody))) {
                callBack()
            }
        })
    }
    getPosition() {
        return [this.x, this.y]
    }
    incrementX(incrementX) {
        this.x += incrementX
        this.overlap.x += incrementX
        this.bar.x += incrementX
        this.healthBar.x += incrementX
    }
    showHealth() {
        var barX = this.x - 28
        var barY = this.y - 84
        this.bar = this.scene.add.rectangle(barX, barY, 56, 8, 0xFF0000).setDepth(4)
        this.bar.setOrigin(0, 0)

        this.healthBar = this.scene.add.rectangle(barX, barY, 56, 8, 0x00FF00).setDepth(4)
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
    }
    hideObject() {
        this.setVisible(false)
        this.setSensor(true)
        this.healthBar.setVisible(false)
        this.bar.setVisible(false)
    }
}

export default Object