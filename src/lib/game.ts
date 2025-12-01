import Entity from "./entities/entity.ts";
import Camera from "./entities/camera.ts";
import Controller from "./entities/controller.ts";

export default class Game {
    static STATE = {
        PLAYING: 'PLAYING',
        PAUSED: 'PAUSED',
        MENU: 'MENU',
        PREPARE_NEXT_ROUND: 'PREPARE_NEXT_ROUND',
    }
    stateInitial = Game.STATE.MENU
    state = this.stateInitial

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    running: boolean = true
    lastTime: number = 0
    entities: Set<Entity> = new Set()
    world: { w: number, h: number } = {w: 800, h: 600}
    activeCamera!: Camera
    controller!: Controller
    assets: string[] = [
        'fish-white',
        'fish-purple',
        'fish-pink',
        'fish-green',
        'fish-blue',
        'fish-yellow',
        'pellet',
    ]
    sprites: { [key: string]: HTMLImageElement } = {}
    keysPressed: { [key: string]: boolean } = {}
    keysJustPressed: { [key: string]: boolean } = {}
    keyController!: AbortController
    timeElapsed!: number
    debug: boolean = false
    // debug: boolean = true

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        const ctx: CanvasRenderingContext2D | null = this.canvas.getContext('2d')
        if (ctx === null) throw new Error('Unable to get canvas context')
        this.ctx = ctx
        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = 'high'
        this.ctx.fillStyle = 'midnightBlue'
        this.ctx.strokeStyle = 'green'
        this.ctx.lineWidth = 2
    }

    start = (): void => {
        this.state = this.stateInitial
        this.timeElapsed = 0

        this.running = true
        this.setupKeyListeners()

        this.entities = new Set()

        this.controller = new Controller()
        this.addEntity(this.controller)

        const camera = Camera._default(this)
        this.activeCamera = camera

        this.addEntity(camera)

        for (const ety of this.entities) {
            ety.onGameStart()
        }

        console.log('Game started')
        requestAnimationFrame(this.loop)
    }

    stop = (): void => {
        this.running = false
        this.keyController.abort()
        console.log('Game stopped')
    }

    reset = (): void => {
        this.stop()
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.start()
            })
        })
    }

    loop = (currentTime: number): void => {
        if (!this.running) return
        const delta: number = currentTime - this.lastTime
        this.timeElapsed += delta

        for (const entity of this.entities) {
            entity.processCollisions()
            entity.process(delta)
            entity.clearCollisions()
        }

        this.render(this.debug)

        this.lastTime = currentTime
        requestAnimationFrame(this.loop)
    }


    render = (debug: boolean = false): void => {
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        const override: Entity[] = []
        for (const ety of this.entities) {
            if (ety.overrideRender) {
                override.push(ety)
                continue
            }
            this.renderEntity(ety, debug)
        }
        for (const ety of override) {
            this.ctx.save()
            ety.render(this.ctx)
            this.ctx.restore()
        }
    }

    renderEntity = (ety: Entity, debug: boolean = false): void => {
        if (ety.sprite.name === null) return
        const widthRatio: number = this.canvas.width / this.world.w
        const heightRatio: number = this.canvas.height / this.world.h
        const screenX: number = (ety.pos.x - this.activeCamera.pos.x) * this.activeCamera.zoom * widthRatio + this.canvas.width / 2
        const screenY: number = (ety.pos.y - this.activeCamera.pos.y) * this.activeCamera.zoom * heightRatio + this.canvas.height / 2
        this.ctx.save()
        this.ctx.translate(screenX, screenY)
        this.ctx.rotate(ety.rotation)
        this.ctx.drawImage(this.sprites[ety.sprite.name],
            -ety.sprite.w / 2 * widthRatio * this.activeCamera.zoom,
            -ety.sprite.h / 2 * heightRatio * this.activeCamera.zoom,
            ety.sprite.w * widthRatio * this.activeCamera.zoom,
            ety.sprite.h * heightRatio * this.activeCamera.zoom)
        if (debug) { // draw "hitbox"
            this.ctx.strokeRect(
                -ety.dim.w / 2 * widthRatio * this.activeCamera.zoom,
                -ety.dim.h / 2 * heightRatio * this.activeCamera.zoom,
                ety.dim.w * widthRatio * this.activeCamera.zoom,
                ety.dim.h * heightRatio * this.activeCamera.zoom
            )
        }
        this.ctx.restore()
    }

    async loadAssets(): Promise<boolean> {
        try {
            await Promise.all(this.assets.map(assetName => this.loadImage(assetName)))
            return true
        } catch (error) {
            console.error('Failed to load assets', error)
            return false
        }
    }

    loadImage(assetName: string): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = () => reject(new Error(`Failed to load asset: ${assetName}`))
            img.src = `/sprites/${assetName}.png`
            this.sprites[assetName] = img
        })
    }

    addEntity(ety: Entity): void {
        ety.game = this
        ety.onCreate()
        this.entities.add(ety)
    }

    removeEntity(ety: Entity): void {
        ety.onRemove()
        this.entities.delete(ety)
    }

    removeEntitiesOfType(...types: string[]): void {
        for (const type of types) {
            for (const ety of this.entities) {
                if (ety.type === type) this.removeEntity(ety)
            }
        }
    }

    queryEntitiesByType(type: string): Entity[] {
        return [...this.entities].filter((ety) => ety.type === type)
    }

    queryEntity(type: string): Entity | null {
        return [...this.entities].find((ety) => ety.type === type) ?? null
    }

    setupKeyListeners(): void {
        this.keyController = new AbortController()
        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.key] = true
            this.keysJustPressed[e.key] = true
            requestAnimationFrame(() => {
                this.keysJustPressed[e.key] = false
            })
        }, {signal: this.keyController.signal})
        window.addEventListener('keyup', (e) => {
            requestAnimationFrame(() => {
                this.keysPressed[e.key] = false
                this.keysJustPressed[e.key] = false
            })
        }, {signal: this.keyController.signal})
    }

    keyPressed(key: string): boolean {
        return this.keysPressed[key]
    }

    keyJustPressed(key: string): boolean {
        // TODO: alpha, lower/upper case, actual "controls" and not just keys
        return this.keysJustPressed[key]
    }

    getWorldMidpoint(): { x: number, y: number } {
        return { x: this.world.w / 2, y: this.world.h / 2 }
    }
}