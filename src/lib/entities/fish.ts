import Entity from './entity.ts'
import GameUtils from '../game-utils.ts'
import Game from '../game.ts'
import Player from './player.ts'

export default class Fish extends Entity {
    type = 'Fish'
    canCollide = true
    size = 0
    onCreate() {
        const randSize = GameUtils.randIntBetween(10, Player.goalSize * 3/4 )
        const spriteName = 'fish-' + GameUtils.randChoice(['purple', 'pink', 'green', 'blue', 'yellow'])
        this.size = randSize
        this.dim = { w: randSize * 0.8, h: randSize / 3}
        this.pos = {
            x: Math.random() > 0.5 ? -this.dim.w / 2 : this.game.world.w + this.dim.w / 2,
            y: GameUtils.randIntBetween(0, this.game.world.h),
        }
        this.rotation = this.pos.x < 0 ? 0 : -Math.PI
        this.moveForce = GameUtils.randFloatBetween(0.05, 0.25)
        this.vel.max = { x: this.moveForce, y: this.moveForce}
        this.sprite = { name: spriteName, w: randSize, h: randSize }

        this.connect('eaten', this._onEaten)
    }

    process(delta: number) {
        if (this.isOutOfWorldBounds() && this.game.state !== Game.STATE.PREPARE_NEXT_ROUND) {
            this.destroy()
        }
        this.applyForce(delta)
        this.applyPhysics(delta)
    }

    updateSize(size: number) {
        this.moveForce *= (size / this.size)
        this.vel.max = { x: this.moveForce, y: this.moveForce}
        this.size = size
        this.sprite.w = size
        this.sprite.h = size
        this.dim.w = size * 0.8
        this.dim.h = size / 3
    }

    _onEaten() {
        this.destroy()
    }
}