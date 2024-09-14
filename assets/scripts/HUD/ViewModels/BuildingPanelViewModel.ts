import { Subject } from "rxjs";
import { TowerBuilding } from "../../TowerBuilding";
import { HUDClicksManager } from "../HUDClicksManager";
import { Vec2 } from "cc";
import { HUDManager } from "../HUDManager";

export class BuildingPanelViewModel{

    public togglePanelVisible$: Subject<boolean> = new Subject<boolean>();
    private _isPanelVisible:boolean = false;

    constructor(){
        TowerBuilding.onAnyTowerBuildingClicked$.subscribe(() => {
            this.onAnyTowerBuildingClickedCallback();
        });

        HUDClicksManager.Instance?.onHUDClicked$.subscribe((clickPosition: Vec2) => {
            this.onHUDClickedCallback(clickPosition);
        });
    }

    private onAnyTowerBuildingClickedCallback(){
        this.togglePanel(!this._isPanelVisible)
        console.log("Display panel: " + this._isPanelVisible);
    }

    private onHUDClickedCallback(clickPosition:Vec2){
        const isPositionOverBuildingPanel = HUDManager.Instance?.isPositionOverBuildingPanelContainer(clickPosition);
        
        console.log("x@ PositionOverPanel = " + isPositionOverBuildingPanel);
        if(!isPositionOverBuildingPanel){
            this.togglePanel(false);
            return;
        }
    }

    private togglePanel(toggleValue:boolean){
        this._isPanelVisible = toggleValue;
        this.togglePanelVisible$.next(this._isPanelVisible);
    }
}


