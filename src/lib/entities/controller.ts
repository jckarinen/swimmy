import Entity from "./entity.ts";
import Player from "./player.ts";
import Spawner from './spawner.ts'
import UI from './ui.ts'
import Game from '../game.ts'
import type Fish from './fish.ts'

export default class Controller extends Entity {

    onGameStart() {
        this.game.addEntity((new UI()))

        this.connect('playerInputStartGame', this._onPlayerInputStartGame)
        this.connect('playerEaten', this._onPlayerEaten)
        this.connect('playerReachedGoalSize', this._onPlayerReachedGoalSize)
        this.connect('zoomOutCompleted', this._onZoomOutCompleted)
    }
    process() {
        if (this.game.keyJustPressed('r')) this._onPlayerInputResetGame()
    }

    _onPlayerEaten() {
        this._onPlayerInputResetGame()
    }

    _onPlayerReachedGoalSize(event: { player: Player }) {
        this.game.state = Game.STATE.PREPARE_NEXT_ROUND
        this.game.activeCamera.zoomOut(event.player)
    }

    _onZoomOutCompleted() {
        const player = this.game.queryEntity('Player') as Player
        if (!player) return
        const worldMidpoint = this.game.getWorldMidpoint()
        const scaledCoords = (ety: Entity): { x: number, y: number } => {
            return {
                x: worldMidpoint.x + (ety.pos.x - worldMidpoint.x) * this.game.activeCamera.zoomEnd,
                y: worldMidpoint.y + (ety.pos.y - worldMidpoint.y) * this.game.activeCamera.zoomEnd
            }
        }
        player.onCreate() // reset player state (speed, etc)
        player.pos = scaledCoords(player) // update pos so that player appears where they were
        this.game.removeEntitiesOfType('Pellet') // clear pellets
        // scale down all fish
        for (const fish of this.game.queryEntitiesByType('Fish') as Fish[]) {
            if (fish.size <= Player.goalSize / 7) this.game.removeEntity(fish) // delete ones that are too small anyway
            fish.pos = scaledCoords(fish)
            fish.updateSize(fish.size * this.game.activeCamera.zoomEnd)
        }
        this.game.activeCamera.reset()
        this.game.state = Game.STATE.PLAYING
        this.emitGlobal('beginNextRound')
    }

    _onPlayerInputResetGame() {
        this.emitGlobal('resetGame')
        const player = this.game.queryEntity('Player') as Player
        if (!player) return
        player.pos = this.game.getWorldMidpoint()
        player.onCreate()
        player.pos = this.game.getWorldMidpoint()
        this.game.removeEntitiesOfType('Fish', 'Pellet', 'Spawner', 'Player')
        this.game.state = Game.STATE.MENU
    }

    _onPlayerInputStartGame() {
        const player = new Player();
        player.pos = this.game.getWorldMidpoint()
        this.game.addEntity(player)
        this.game.addEntity(new Spawner())
        this.game.state = Game.STATE.PLAYING
    }
}