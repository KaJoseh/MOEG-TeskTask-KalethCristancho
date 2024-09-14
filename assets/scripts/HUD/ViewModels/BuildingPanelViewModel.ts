import { Vec2 } from "cc";
import { BehaviorSubject, Subject } from "rxjs";
import { TowerBuilding } from "../../TowerBuilding";
import { HUDClicksManager } from "../HUDClicksManager";
import { HUDManager } from "../HUDManager";
import { BuildingData } from "../../GameSettingsManager";

export class BuildingPanelViewModel{

    public togglePanelVisible$: Subject<boolean> = new Subject<boolean>();
    private _panelSettings: BehaviorSubject<PanelSettings> = new BehaviorSubject<PanelSettings>(new PanelSettings("", "", 0));
    public get panelSettings$(){
        return this._panelSettings.asObservable();
    }

    private _isPanelVisible:boolean = false;

    constructor(){
        TowerBuilding.onAnyTowerBuildingClicked$.subscribe((buildingData: BuildingData) => {
            this.onAnyTowerBuildingClickedCallback(buildingData);
        });

        HUDClicksManager.Instance?.onHUDClicked$.subscribe((clickPosition: Vec2) => {
            this.onHUDClickedCallback(clickPosition);
        });
    }

    private onAnyTowerBuildingClickedCallback(buildingData: BuildingData){
        this.togglePanel(!this._isPanelVisible)
        if(this._isPanelVisible){
            const newPanelSettings = new PanelSettings(buildingData.name, buildingData.description, buildingData.settings.hireSlots);
            this._panelSettings.next(newPanelSettings);
        }
    }

    private onHUDClickedCallback(clickPosition:Vec2){
        const isPositionOverBuildingPanel = HUDManager.Instance?.isPositionOverBuildingPanelContainer(clickPosition);
        
        // console.log("x@ PositionOverPanel = " + isPositionOverBuildingPanel);
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

export class PanelSettings{
    name:string;
    description:string;
    hireSlots:number;

    constructor(name:string, description:string, hireSlots:number){
        this.name = name;
        this.description = description;
        this.hireSlots = hireSlots;
    }
}


