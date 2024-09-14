import { Subject } from "rxjs";
import { TowerBuilding } from "../../TowerBuilding";

export class BuildingPanelViewModel{

    public togglePanelVisible$: Subject<boolean> = new Subject<boolean>();
    private _displayPanel:boolean = false;

    constructor(){
        TowerBuilding.onAnyTowerBuildingClicked$.subscribe(() => {
            this.onAnyTowerBuildingClickedCallback();
        });
    }

    private onAnyTowerBuildingClickedCallback(){
        this._displayPanel = !this._displayPanel;
        this.togglePanelVisible$.next(this._displayPanel);
        console.log("Display panel: " + this._displayPanel);
    }
}


