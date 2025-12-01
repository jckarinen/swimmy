import Entity from "./entity.ts";
import type Pellet from './pellet.ts'
import type Fish from './fish.ts'
import GameUtils from '../game-utils.ts'

export default class Player extends Entity {
    type = 'Player'
    static initialSize = 16
    static goalSize = 200
    size!: number
    growthConstant = 7

    onCreate() {
        this.size = Player.initialSize
        this.sprite = { name: 'fish-white', w: this.size, h: this.size }
        this.dim = {w: this.sprite.w, h: this.sprite.w / 3}
        this.moveForce = 0.1
        this.vel = {x: 0, y: 0, max: {x: 0.17, y: 0.17}}
        this.rotation = this.rotation != 0 ? this.rotation : 0
        this.handling = 0.01
        this.friction = 0.005
        this.canCollide = true
        this.checkCollisions = true
    }

    process(delta: number) {
        this.onCollideWith('Pellet', (pellet: Pellet) => {
            this.emitTo(pellet, 'eaten')
            this._onConsume(this.growthConstant * 0.4)
        })

        this.onCollideWith('Fish', (fish: Fish) => {
            if (this.size > fish.size) {
                this._onConsume(fish.size / this.size * this.growthConstant)
                this.emitTo(fish, 'eaten')
            }
            else (this._onEaten())
        })

        if (this.game.keyPressed('d') || this.game.keyPressed('ArrowRight')) {
            this.rotation += this.handling * delta
        }
        if (this.game.keyPressed('a') || this.game.keyPressed('ArrowLeft')) {
            this.rotation -= this.handling * delta
        }
        if (this.game.keyJustPressed(' ')) {
            this.applyForce(delta)
        }

        this.applyPhysics(delta)
        this.stayInBounds()
    }

    _onConsume(factor: number = 1) {
        if (this.size === Player.goalSize) return
        this.size = GameUtils.clamp(this.size + factor, this.size, Player.goalSize)
        this.sprite.w = this.size
        this.sprite.h = this.size
        this.dim.w = this.size
        this.dim.h = this.size / 3
        const moveGrowthFactor = (1 + factor * 0.005)
        this.moveForce *= moveGrowthFactor
        this.vel.max = {x: this.vel.max.x * moveGrowthFactor, y: this.vel.max.y * moveGrowthFactor}
        this.emitGlobal('playerGrow', { player: this })
        if (this.size >= Player.goalSize) {
            this.emitGlobal('playerReachedGoalSize', { player: this })
        }
    }

    _onEaten() {
        this.emitGlobal('playerEaten')
    }
}