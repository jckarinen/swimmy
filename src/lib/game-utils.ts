import type Entity from "./entities/entity.ts";

export default class GameUtils {
    static isCollidingWith(ety1: Entity, ety2: Entity) {
        const corners1 = this.getRotatedCorners(ety1);
        for (const corner of corners1) {
            if (this.pointInRotatedBox(corner.x, corner.y, ety2.pos.x, ety2.pos.y, ety2.dim.w, ety2.dim.h, ety2.rotation)) {
                return true;
            }
        }
        const corners2 = this.getRotatedCorners(ety2);
        for (const corner of corners2) {
            if (this.pointInRotatedBox(corner.x, corner.y, ety1.pos.x, ety1.pos.y, ety1.dim.w, ety1.dim.h, ety1.rotation)) {
                return true;
            }
        }
        return false;
    }

    static getRotatedCorners(ety: Entity): {x: number, y: number}[] {
        const cos = Math.cos(ety.rotation);
        const sin = Math.sin(ety.rotation);
        const halfW = ety.dim.w / 2;
        const halfH = ety.dim.h / 2;

        const localCorners = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: -halfW, y: halfH },
            { x: halfW, y: halfH }
        ];

        return localCorners.map(corner => ({
            x: ety.pos.x + corner.x * cos - corner.y * sin,
            y: ety.pos.y + corner.x * sin + corner.y * cos
        }));
    }

    static pointInRotatedBox(px: number, py: number, boxX: number, boxY: number, boxWidth: number, boxHeight: number, boxRotation: number): boolean {
        const cos = Math.cos(-boxRotation);
        const sin = Math.sin(-boxRotation);

        const dx = px - boxX;
        const dy = py - boxY;

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        return Math.abs(localX) <= boxWidth / 2 &&
            Math.abs(localY) <= boxHeight / 2;
    }

    static clamp(val: number, min: number, max: number): number {
        if (val < min) return min
        if (val > max) return max
        return val
    }

    static randIntBetween(start: number, end: number) {
        return Math.floor(Math.random() * (end - start + 1)) + start
    }

    static randFloatBetween(start: number, end: number) {
        return Math.random() * (end - start) + start
    }

    static randChoice(arr: Array<unknown>): unknown {
        return arr[GameUtils.randIntBetween(0, arr.length - 1)]
    }

    static randPointWithin(dim: { w: number, h: number}): {x: number, y: number} {
        return {
            x: Math.random() * dim.w,
            y: Math.random() * dim.h
        }
    }

    static isEntityWithinBounds(ety: Entity, x1: number, y1: number, x2: number, y2: number,  bufX: number = 0, bufY: number = 0) {
        return (x1 - bufX <= ety.pos.x && ety.pos.x <= x2 + bufX) && (y1 - bufY <= ety.pos.y && ety.pos.y <= y2 + bufY)
    }

    static lerp(start: number, end: number, t: number) {
        return start + (end - start) * t
    }

    static easeInOutCubic(t: number): number {
        return t < 0.5
            ? 4 * Math.pow(t, 3)
            : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

}