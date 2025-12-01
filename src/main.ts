import Game from './lib/game.ts'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const game = new Game(canvas)
const assetsLoaded = await game.loadAssets()
if (!assetsLoaded) throw new Error('Unable to load game assets')
game.start()

