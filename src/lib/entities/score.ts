import Entity from './entity.ts'
import Game from '../game.ts'

export default class Score extends Entity {
    overrideRender = true
    color = 'rgba(255,255,255,0.75)'
    score = 0

    onCreate() {
        this.connect('resetGame', this._onResetGame)
        this.connect('playerReachedGoalSize', this._onPlayerReachedGoalSize)
        this.connect('playerEaten', this._onPlayerEaten)
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.game.state !== Game.STATE.PLAYING && this.game.state !== Game.STATE.PREPARE_NEXT_ROUND) return

        ctx.fillStyle = this.color
        ctx.font = 'bold 36px monospace'
        ctx.fillText(`score: ${this.score}`, 12, 42)
    }

    _onResetGame() {
        this.score = 0
    }

    _onPlayerReachedGoalSize() {
        this.score++
    }

    _onPlayerEaten() {
        this.score = 0
    }

}