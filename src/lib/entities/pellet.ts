import Entity from './entity.ts'

export default class Pellet extends Entity {
    type = 'Pellet'
    static max = 50
    static count = 0
    sprite = {name: 'pellet', w: 7, h: 7}
    dim = {w: this.sprite.w, h: this.sprite.h}
    canCollide = true

    onCreate() {
        Pellet.count++
        this.connect('eaten', this._eaten)
    }

    onRemove() {
        Pellet.count--
    }

    _eaten() {
        this.destroy()
    }
}