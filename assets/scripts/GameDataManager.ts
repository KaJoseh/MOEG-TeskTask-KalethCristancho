import { _decorator, CCString, Component, Node, SpriteFrame } from 'cc';
import { BuildingData, BuildingsJsonData, HeroData, HeroesJsonData, InitialStateJsonData } from './GameData';
import { JsonLoader } from './JsonLoader';
const { ccclass, property } = _decorator;

@ccclass('HeroSpriteDictionary')
class HeroSpriteDictionary{
    @property(CCString)
    heroId:string = "";
    @property(SpriteFrame)
    heroSpriteFrame:SpriteFrame | null = null;
}

@ccclass('RankSpriteDictionary')
class RankSpriteDictionary{
    @property(CCString)
    rankId:string = "";
    @property(SpriteFrame)
    rankSpriteFrame:SpriteFrame | null = null;
}

@ccclass('ElementSpriteDictionary')
class ElementSpriteDictionary{
    @property(CCString)
    elementId:string = "";
    @property(SpriteFrame)
    elementSpriteFrame:SpriteFrame | null = null;
}

@ccclass('GameDataManager')
export class GameDataManager extends Component {
    public static Instance:GameDataManager | null = null;

    @property({ type: [HeroSpriteDictionary] })
    private heroIconSpriteDictList: HeroSpriteDictionary[] = [];
    @property({ type: [RankSpriteDictionary] })
    private rankSpriteDictList: RankSpriteDictionary[] = [];
    @property({ type: [ElementSpriteDictionary] })
    private elementSpriteDictList: ElementSpriteDictionary[] = [];

    private _initialStateJsonData:InitialStateJsonData | null = null;
    private _buildingsJsonData:BuildingsJsonData | null = null;
    private _heroesJsonData:HeroesJsonData | null = null;

    private _settingsLoaded: Promise<void> | null = null;

    protected onLoad(): void {
        GameDataManager.Instance = this;

        this.loadSettingsFromJsons();
    }

    private loadSettingsFromJsons(){
        this._settingsLoaded = new Promise((resolve, reject) =>{
            const amountOfFilesToLoadFrom = 3;
            let loadCount = 0;

            const onLoadComplete = () => {
                loadCount++;
                if (loadCount === amountOfFilesToLoadFrom) {
                    console.log("GameDataManager | Promise completed! SettingsLoaded!");
                    resolve();
                }
            };

            //Initial State
            JsonLoader.GetObjectFromJson<InitialStateJsonData>("settings/initial_state", (result: InitialStateJsonData) => {
                this._initialStateJsonData = result;
                onLoadComplete();
            });

            //heroes
            JsonLoader.GetObjectFromJson<HeroesJsonData>("settings/heroes", (result: HeroesJsonData) => {
                this._heroesJsonData = result;
                onLoadComplete();
            });

            //buildings
            JsonLoader.GetObjectFromJson<BuildingsJsonData>("settings/buildings", (result: BuildingsJsonData) => {
                this._buildingsJsonData = result;
                onLoadComplete();
            });
        });
    }

    public async getInitialMoney() : Promise<number | undefined> {
        await this._settingsLoaded;
        const initialStateData = this._initialStateJsonData;
        if(initialStateData === null){
            console.warn("No initialStateData found");
        }

        return initialStateData?.state.currency;
    }

    public async getBuildingDataById(buildingId:string) : Promise<BuildingData | undefined> {
        await this._settingsLoaded;
        const buildingData = this._buildingsJsonData?.buildings.filter(building => building.id === buildingId)[0];
        if(buildingData === undefined){
            console.warn("No building data found for the following id: " + buildingId);
        }

        return buildingData;
    }

    public async getHeroDataById(heroId:string) : Promise<HeroData | undefined> {
        await this._settingsLoaded;
        const heroData = this._heroesJsonData?.heroes.filter(hero => hero.id === heroId)[0];
        if(heroData === undefined){
            console.warn("No heroData found for the following id: " + heroId);
        }

        return heroData;
    }

    public getHeroesData(): HeroData[] | undefined {
        const heroData = this._heroesJsonData?.heroes;
        return heroData;
    }

    public getHeroIconSpriteFrame(heroId:string) : SpriteFrame | null{
        const heroIcon = this.heroIconSpriteDictList.filter(icon => icon.heroId == heroId);
        return heroIcon[0].heroSpriteFrame;
    }

    public getRankSpriteFrame(rankId:string) : SpriteFrame | null{
        const rankIcon = this.rankSpriteDictList.filter(icon => icon.rankId == rankId);
        return rankIcon[0].rankSpriteFrame;
    }

    public getElementSpriteFrame(elementId:string) : SpriteFrame | null{
        const elementIcon = this.elementSpriteDictList.filter(icon => icon.elementId == elementId);
        return elementIcon[0].elementSpriteFrame;
    }
}


