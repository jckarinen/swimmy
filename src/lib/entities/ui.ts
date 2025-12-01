import Entity from './entity.ts'
import ProgressBar from './progress-bar.ts'
import StartMenu from './start-menu.ts'
import Score from './score.ts'

export default class UI extends Entity {
    type = 'UI'
    onGameStart() {
        this.addChild(new ProgressBar())
        this.addChild(new StartMenu())
        this.addChild(new Score())
    }
}