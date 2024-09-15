import { _decorator, CCString, Component, EventMouse, EventTouch, Input, Node } from 'cc';
import { Subject } from 'rxjs';
import { BuildingData, GameSettingsManager } from './GameSettingsManager';
const { ccclass, property } = _decorator;

@ccclass('TowerBuilding')
export class TowerBuilding extends Component {
    
    public static onAnyTowerBuildingClicked$: Subject<BuildingData> = new Subject<BuildingData>();

    @property(CCString)
    private buildingId: string = "";
    @property(Node)
    private towerSpriteNode:Node | null = null;

    private _buildingData:BuildingData | undefined;
    
    protected onLoad(): void {
        this.towerSpriteNode?.on(Input.EventType.TOUCH_START, this.onTowerSpriteTouchStart, this);
    }

    protected onDestroy(): void {
        this.towerSpriteNode?.off(Input.EventType.TOUCH_START, this.onTowerSpriteTouchStart, this);
    }

    protected async start(): Promise<void> {
        const buildingData = await GameSettingsManager.Instance?.getBuildingDataById(this.buildingId);
        if(buildingData === undefined){
            return;
        }

        //Add every hero as summonable
        const heroData = GameSettingsManager.Instance?.getHeroesData();
        if(heroData !== undefined){
            heroData.forEach(hero => {
                buildingData.settings.summonableHeroes.push(hero);
            });
        }

        this._buildingData = buildingData;
    }

    private onTowerSpriteTouchStart(event: EventTouch){
        if(this._buildingData !== undefined){
            TowerBuilding.onAnyTowerBuildingClicked$.next(this._buildingData);
            // console.log("TOWER CLICKED!");
        }
        else{
            console.warn("TowerBuilding | onTowerSpriteTouchStart: buildingData is undefined.")
        }
    }
}


