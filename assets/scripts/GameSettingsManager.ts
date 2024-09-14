import { _decorator, Component, Node } from 'cc';
import { JsonLoader } from './JsonLoader';
const { ccclass, property } = _decorator;

@ccclass('GameSettingsManager')
export class GameSettingsManager extends Component {

    public static Instance:GameSettingsManager | null = null;

    private _initialStateJsonData:InitialStateJsonData | null = null;
    private _buildingsJsonData:BuildingsJsonData | null = null;
    private _heroesJsonData:HeroesJsonData | null = null;

    protected onLoad(): void {
        GameSettingsManager.Instance = this;

        this.loadSettingsFromJsons();
    }

    protected start(): void {
        // console.log(`SettingsManager | currency:${this._initialStateJsonData?.state.currency}`);
        // console.log(`SettingsManager | buildingsCount:${this._buildingsJsonData?.buildings[0].name}`);
        // console.log(`SettingsManager | heroesCount:${this._heroesJsonData?.heroes[0].name}`);
    }

    private loadSettingsFromJsons(){
        //Initial State
        JsonLoader.GetObjectFromJson<InitialStateJsonData>("settings/initial_state", (result: InitialStateJsonData) => {
            this._initialStateJsonData = result;
        });

        //heroes
        JsonLoader.GetObjectFromJson<HeroesJsonData>("settings/heroes", (result: HeroesJsonData) => {
            this._heroesJsonData = result;
        });

        //buildings
        JsonLoader.GetObjectFromJson<BuildingsJsonData>("settings/buildings", (result: BuildingsJsonData) => {
            this._buildingsJsonData = result;
        });
    }

    public getBuildingDataById(buildingId:string) : BuildingData | undefined {
        const buildingData = this._buildingsJsonData?.buildings.filter(building => building.id === buildingId)[0];
        if(buildingData === undefined){
            console.warn("No building data found for the following id: " + buildingId);
        }

        return buildingData;
    }

}

export interface BuildingsJsonData{
    buildings: Array<BuildingData>;
}
export interface BuildingData{
    id:string;
    name:string;
    description:string;
    cost:number;
    settings:{
        hireSlots: number;
    }
}

export interface HeroesJsonData{
    heroes: Array<HeroData>;
}
export interface HeroData{
    id:string;
    name: string;
    description:string;
    cost:number;
    summonCooldown:number;
    type:string;
    rank:string;
}

export interface InitialStateJsonData{
    state: {
        currency:number;
        buildings: Array<string>;
        heroes: Array<string>;
    }
}