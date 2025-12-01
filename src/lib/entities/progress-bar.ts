import Entity from './entity.ts'
import Player from './player.ts'
import Game from '../game.ts'
import GameUtils from '../game-utils.ts'

export default class ProgressBar extends Entity {
    overrideRender = true
    w = 200
    h = 50
    offset = { x: 10, y: 5 }
    fillBackground = 'rgba(0,0,0,0.4)'
    fillProgress = 'rgba(100,232,0,0.5)'
    progress = 0

    onCreate() {
        this.connect('playerGrow', this._onPlayerGrow)
        this.connect('resetGame', this._onResetGame)
        this.connect('beginNextRound', this._onBeginNextRound)
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.game.state !== Game.STATE.PLAYING && this.game.state !== Game.STATE.PREPARE_NEXT_ROUND) return

        const radius = 10

        // progress bar background
        ctx.fillStyle = this.fillBackground
        ctx.beginPath()
        ctx.roundRect(
            this.game.world.w - this.w - this.offset.x,
            this.game.world.h - this.h - this.offset.y,
            this.w - this.offset.x,
            this.h - this.offset.y,
            radius
        )
        ctx.fill()

        const radius2 = this.progress === 1 ? 10 : 0

        // progress bar fill
        ctx.fillStyle = this.fillProgress
        ctx.beginPath()
        ctx.roundRect(
            this.game.world.w - this.w - this.offset.x,
            this.game.world.h - this.h - this.offset.y,
            (this.w - this.offset.x) * this.progress,
            this.h - this.offset.y,
            [radius, radius2, radius2, radius]
        )
        ctx.fill()

    }

    _onPlayerGrow(event: { player: Player } ): void {
        this.progress = GameUtils.clamp((event.player.size - Player.initialSize) / (Player.goalSize - Player.initialSize), 0, 1)
    }

    _onResetGame() {
        this.progress = 0
    }

    _onBeginNextRound() {
        this.progress = 0
    }

}