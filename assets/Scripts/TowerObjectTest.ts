import { _decorator, Component, EventKeyboard, EventMouse, Input, input, KeyCode, Node } from 'cc';
import { Subject } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('TowerObjectTest')
export class TowerObjectTest extends Component {
    
    public onTowerClicked$:Subject<void> = new Subject<void>;

    protected onLoad(): void {
        this.node.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onDestroy () {
        this.node.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    private onMouseDown (event: EventMouse){
        this.onTowerClicked$.next();
    } 

}


