class TextBox extends Phaser.GameObjects.Rectangle {
    constructor(scene, zoom) {
        // setup dialogue box
        const styleSpeaker = {
            fontSize: '22px',
            color: 'white',
            fontFamily: 'Calibri'
        }
        const styleDialogue = {
            fontSize: '18px',
            color: 'white',
            fontFamily: 'Calibri',
            wordWrap: { width: scene.cameras.main.displayWidth - 100, useAdvancedWrap: true }
        }
        const styleReplay = {
            fontSize: '16px',
            color: 'white',
            fontFamily: 'Calibri'
        }
        super(scene, scene.cameras.main.centerX, scene.cameras.main.displayHeight - 75, scene.cameras.main.displayWidth, 200, 0x000000).setScrollFactor(0, 0)
        this.speakerText = scene.add.text(50, scene.cameras.main.displayHeight - 140, 'Filler text', styleSpeaker).setScrollFactor(0, 0)
        this.dialogueText = scene.add.text(50, scene.cameras.main.displayHeight - 105, 'Filler text', styleDialogue).setScrollFactor(0, 0)
        this.replayText = scene.add.text(scene.cameras.main.displayWidth - 50, scene.cameras.main.displayHeight - 40, 'Click to replay', styleReplay).setScrollFactor(0, 0).setOrigin(1, 0)
        this.exit = scene.add.image(scene.cameras.main.displayWidth - 50, scene.cameras.main.displayHeight - 120, 'buttons', 2).setScrollFactor(0, 0).setScale(zoom).setInteractive({ cursor: 'pointer' })
        this.exit.on('pointerup', () => {
            this.setDialogueVisible(false)
        })
        this.dialogueText.setDepth(3)
        this.speakerText.setDepth(3)
        this.replayText.setDepth(3)
        this.exit.setDepth(3)
        this.setDepth(2)
        this.setInteractive()
        this.visible = false
        this.dialogueText.visible = false
        this.speakerText.visible = false
        this.replayText.visible = false
        this.exit.visible = false

        // setup instructions
        this.instructions = []
        const styleInstructions = {
            fontSize: '22px',
            color: 'white'
        }
        this.textPress = scene.add.text(scene.cameras.main.centerX - 180, scene.cameras.main.displayHeight - 85, 'Press', styleInstructions).setScrollFactor(0, 0)
        this.textEngage = scene.add.text(scene.cameras.main.centerX + 60, scene.cameras.main.displayHeight - 85, 'to engage.', styleInstructions).setScrollFactor(0, 0)
        this.spaceKey = scene.add.image(scene.cameras.main.centerX - 26, scene.cameras.main.displayHeight - 75, 'spaceKey').setScrollFactor(0, 0)
        this.instructions.push(this.textPress)
        this.instructions.push(this.textEngage)
        this.instructions.push(this.spaceKey)
        this.spaceKey.setScale(zoom)

        // setup questions
        const styleAnswers = {
            fontSize: '18px',
            fontFamily: 'Calibri',
            color: 'white'
        }
        // var answerWidth = (scene.cameras.main.displayWidth / 2) - 75
        // this.boxA = scene.add.rectangle(50, scene.cameras.main.displayHeight - 50, answerWidth, 75, 0xFF0000).setScrollFactor(0, 0)
        // this.boxA.setOrigin(0, 1).setInteractive()
        // this.answerA = scene.add.text(75, scene.cameras.main.displayHeight - 103, 'Answer A', styleAnswers).setScrollFactor(0, 0)
        // this.answerA.setOrigin(0, 0).setInteractive()
        // this.boxB = scene.add.rectangle((scene.cameras.main.displayWidth / 2) + 25, scene.cameras.main.displayHeight - 50, answerWidth, 75, 0x00FF00).setScrollFactor(0, 0)
        // this.boxB.setOrigin(0, 1).setInteractive()
        // this.answerB = scene.add.text((scene.cameras.main.displayWidth / 2) + 50, scene.cameras.main.displayHeight - 103, 'Answer B', styleAnswers).setScrollFactor(0, 0)
        // this.answerB.setOrigin(0, 0).setInteractive()

        // add to scene
        this.instructions.forEach(function (object) {
            object.setDepth(2)
            object.visible = false
            scene.add.existing(object)
        })
        scene.add.existing(this)
    }
    setDialogueText(speaker, text) {
        this.speakerText.setText(speaker)
        this.dialogueText.setText(text)
    }
    setDialogueVisible(boolean) {
        this.visible = boolean
        this.dialogueText.visible = boolean
        this.speakerText.visible = boolean
        this.replayText.visible = boolean
        this.exit.visible = boolean
        this.instructions.forEach(function (object) {
            object.visible = false
        })
    }
    setInstructionsVisible(boolean) {
        this.instructions.forEach(function (object) {
            object.visible = boolean
        })
    }
    getDialogueVisible() {
        return this.visible
    }
    getInstructionsVisible() {
        return this.spaceKey.visible
    }
}

export default TextBox