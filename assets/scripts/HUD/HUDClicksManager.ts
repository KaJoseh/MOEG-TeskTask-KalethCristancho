import { _decorator, Component, EventMouse, EventTouch, Input, Node, Vec2 } from 'cc';
import { Subject } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('HUDClicksManager')
export class HUDClicksManager extends Component {

    public static Instance:HUDClicksManager | null = null;

    public onHUDClicked$:Subject<Vec2> = new Subject<Vec2>();

    private _preventEventTouchSwallow:boolean = true;

    protected onLoad(): void {
        HUDClicksManager.Instance = this;
        this.node.on(Input.EventType.TOUCH_START, this.onGlobalHUDTouchStart, this);
    }

    protected onDestroy(): void {
        this.node.off(Input.EventType.TOUCH_START, this.onGlobalHUDTouchStart, this);
    }

    public setPreventSwallowEventTouch(value: boolean){
        this._preventEventTouchSwallow = value;
    }

    private onGlobalHUDTouchStart(event: EventTouch){
        event.preventSwallow = this._preventEventTouchSwallow;

        let mousePosition:Vec2 = new Vec2(event.getLocationX(), event.getLocationY());
        this.onHUDClicked$.next(mousePosition);
    }
}


