import { _decorator, Component, Input, Node } from 'cc';
import { Subject } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('TowerBuilding')
export class TowerBuilding extends Component {
    
    public static onAnyTowerBuildingClicked$: Subject<void> = new Subject<void>();

    @property(Node)
    private towerSpriteNode:Node | null = null;
    
    protected onLoad(): void {
        this.towerSpriteNode?.on(Input.EventType.MOUSE_DOWN, this.onTowerSpriteMouseDown);
    }

    protected onDestroy(): void {
        this.towerSpriteNode?.off(Input.EventType.MOUSE_DOWN, this.onTowerSpriteMouseDown);
    }

    private onTowerSpriteMouseDown(){
        TowerBuilding.onAnyTowerBuildingClicked$.next();
    }
}


