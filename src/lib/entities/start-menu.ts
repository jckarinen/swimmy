import Entity from './entity.ts'
import Game from '../game.ts'

export default class StartMenu extends Entity {
    overrideRender = true
    text = 'press [space] to start'
    // text = "[there's always a bigger fish]"
    altText = "[there's always a bigger fish]"
    inputCooldown = 0

    onCreate() {
        this.connect('resetGame', this._onResetGame)
        this.connect('playerEaten', this._onPlayerEaten)
    }

    render() {
        if (this.game.state != Game.STATE.MENU) return
        this.game.ctx.font = 'bold 36px monospace'
        this.game.ctx.strokeStyle = 'black'
        this.game.ctx.fillStyle = 'white'
        this.game.ctx.fillText(
            this.text,
            this.text !== this.altText ? this.game.world.w / 2 - 240 : this.game.world.w - 725,
            this.game.world.h / 2)
    }

    process(delta: number) {
        if (this.game.state != Game.STATE.MENU) return
        this.inputCooldown = Math.max(this.inputCooldown - delta, 0)
        if (this.game.keyJustPressed(' ')) {
            if (this.inputCooldown !== 0) return
            this.emitGlobal('playerInputStartGame')
        }
    }

    _onResetGame() {
        this.inputCooldown = 500
    }

    _onPlayerEaten() {
        this.text = this.altText
    }
}