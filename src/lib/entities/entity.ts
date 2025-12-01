import type Game from "../game.ts";
import GameUtils from '../game-utils.ts'

export default abstract class Entity {
    type: string = 'Untyped'
    game!: Game
    sprite: {name: string|null, w: number, h: number} = {name: null, w: 0, h: 0}
    pos: {x: number, y: number} = {x: 0, y: 0}
    dim: {w: number, h: number} = {w: 0, h: 0}
    vel: {x: number, y: number, max: {x: number, y: number}} = {x: 0, y: 0, max: {x: 0, y: 0}}
    accel: {x: number, y: number, max: {x: 0, y: 0}} = {x: 0, y: 0, max: {x: 0, y: 0}}
    checkCollisions: boolean = false
    canCollide: boolean = false
    collisions: Map<string, Entity[]> = new Map()
    friction: number = 0
    rotation: number = 0
    handling: number = 0
    moveForce: number = 0
    connections: Map<string, CallableFunction> = new Map()
    children: Set<Entity> = new Set()
    overrideRender = false;

    constructor() {

    }

    onGameStart(): void {

    }

    onCreate(): void {

    }

    onRemove(): void {

    }

    // @ts-ignore
    render(ctx: CanvasRenderingContext2D): void {

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process(_delta: number): void {

    }

    connect(eventName: string, handler: CallableFunction): void {
        this.connections.set(eventName, handler.bind(this))
    }

    emitTo(ety: Entity, eventName: string, event: object = {}): void {
        ety.processEvent(eventName, event)
    }

    emitToChildren(eventName: string, event: object = {}): void {
        for (const ety of this.children) ety.processEvent(eventName, event)
    }

    emitGlobal(eventName: string, event: object = {}): void {
        for (const ety of this.game.entities) {
            ety.processEvent(eventName, event)
        }
    }


    processEvent(eventName: string, event: object = {}) {
        const handler = this.connections.get(eventName)
        if (!handler) return
        handler(event)
    }

    addChild(ety: Entity): void {
        this.children.add(ety)
        this.game.addEntity(ety)
    }

    destroy() {
        this.game.removeEntity(this)
    }

    processCollisions(): void {
        if (!this.checkCollisions) return
        for (const ety of this.game.entities) {
            if (ety === this) continue
            if (!ety.canCollide) continue
            if (GameUtils.isCollidingWith(this, ety)) {
                const arrOfType = this.collisions.get(ety.type)
                if (arrOfType) arrOfType.push(ety)
                else this.collisions.set(ety.type, [ety])
            }
        }
    }

    onCollideWith(type: string, callback: CallableFunction) {
        const collisions = this.collisions.get(type)
        if (!collisions) return
        for (const ety of collisions) {
            callback(ety)
        }
    }

    isOutOfWorldBounds(bufX: number | null = null, bufY: number | null = null): boolean {
        if (!bufX) bufX = this.dim.w
        if (!bufY) bufY = this.dim.h
        return !GameUtils.isEntityWithinBounds(this, 0, 0, this.game.world.w, this.game.world.h, bufX, bufY)
    }

    clearCollisions(): void {
        if (!this.checkCollisions) return
        this.collisions = new Map()
    }

    applyPhysics(delta: number) {
        this.applyAcceleration(delta)
        this.clampVelocity()
        this.applyFriction(delta)
        this.applyVelocity(delta)
    }

    applyAcceleration(delta: number) {
        this.vel.x += this.accel.x * delta
        this.vel.y += this.accel.y * delta
        this.accel.x = 0
        this.accel.y = 0
    }

    applyFriction(delta: number) {
        this.vel.x *= (1 - this.friction * delta)
        this.vel.y *= (1 - this.friction * delta)
    }

    clampVelocity() {
        const curSpeed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y)
        if (curSpeed > this.vel.max.x) {
            this.vel.x = (this.vel.x / curSpeed) * this.vel.max.x
            this.vel.y = (this.vel.y / curSpeed) * this.vel.max.x
        }
    }

    applyVelocity(delta: number) {
        this.pos.x += this.vel.x * delta
        this.pos.y += this.vel.y * delta
    }

    applyForce(delta: number, force: number | null = null) {
        force = force ?? this.moveForce
        this.accel.x += Math.cos(this.rotation) * force * delta
        this.accel.y += Math.sin(this.rotation) * force * delta
    }

    stayInBounds(): void {
        this.pos.x = GameUtils.clamp(this.pos.x, this.dim.w / 2, this.game.world.w - this.dim.w / 2)
        this.pos.y = GameUtils.clamp(this.pos.y, this.dim.h / 2, this.game.world.h - this.dim.h / 2)
    }
}