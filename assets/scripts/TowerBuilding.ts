import { _decorator, Component, EventMouse, EventTouch, Input, Node } from 'cc';
import { Subject } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('TowerBuilding')
export class TowerBuilding extends Component {
    
    public static onAnyTowerBuildingClicked$: Subject<void> = new Subject<void>();

    @property(Node)
    private towerSpriteNode:Node | null = null;
    
    protected onLoad(): void {
        this.towerSpriteNode?.on(Input.EventType.TOUCH_START, this.onTowerSpriteTouchStart, this);
    }

    protected onDestroy(): void {
        this.towerSpriteNode?.off(Input.EventType.TOUCH_START, this.onTowerSpriteTouchStart, this);
    }

    private onTowerSpriteTouchStart(event: EventTouch){
        TowerBuilding.onAnyTowerBuildingClicked$.next();
        console.log("TOWER CLICKED!");
    }
}


