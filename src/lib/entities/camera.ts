import Entity from "./entity.ts";
import type Game from "../game.ts";
import GameUtils from '../game-utils.ts'
import Player from './player.ts'

export default class Camera extends Entity {
    initialZoom = 1
    zoom: number = this.initialZoom
    zoomStart = 0
    zoomEnd = 0
    zoomingOut = false
    zoomTime = 0
    zoomDuration = 1500

    static _default(game: Game): Camera {
        const camera = new Camera()
        camera.pos.x = game.world.w / 2
        camera.pos.y = game.world.h / 2
        camera.game = game
        return camera
    }

    reset() {
        this.zoom = this.initialZoom
    }

    process(delta: number) {
        if (this.zoomingOut) {
            this.zoomTime = GameUtils.clamp(this.zoomTime + delta, 0, this.zoomDuration)
            const progress = this.zoomTime / this.zoomDuration
            const easedT = GameUtils.easeInOutCubic(progress)
            this.zoom = GameUtils.lerp(this.zoomStart, this.zoomEnd, easedT)

            if (this.zoomTime < this.zoomDuration) return
            this.zoomingOut = false
            this.zoomTime = 0
            this.zoomStart = 0
            this.emitGlobal('zoomOutCompleted')
        }
    }

    zoomOut(player: Player) {
        this.zoomStart = this.zoom
        this.zoomingOut = true
        this.zoomEnd = 1 / (player.size / Player.initialSize * this.zoom)
    }

}