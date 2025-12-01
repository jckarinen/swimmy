import Entity from './entity.ts'
import Pellet from './pellet.ts'
import GameUtils from '../game-utils.ts'
import Fish from './fish.ts'
import Game from '../game.ts'

export default class Spawner extends Entity {
    type = 'Spawner'
    totalSpawns: { [key: string]: number } = { fish: 0}

    onCreate() {
        Pellet.count = 0
    }
    process() {
        if (this.game.state != Game.STATE.PLAYING) return

        if (Math.random() > 0.99 && Pellet.count != Pellet.max) {
            this._onSpawnPellet()
        }

        if (Math.random() > 0.98) {
            this._onSpawnFish()
        }
    }

    _onSpawnPellet(): void {
        if (Pellet.count >= Pellet.max) return
        const pellet = new Pellet()
        pellet.pos = GameUtils.randPointWithin(this.game.world)
        this.game.addEntity(pellet)
    }

    _onSpawnFish(): void {
        this.game.addEntity(new Fish())
        this.totalSpawns.fish++
    }

}