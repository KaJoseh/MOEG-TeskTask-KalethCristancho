import { _decorator, Component, Node } from 'cc';
import { HeroData } from './GameData';
import { BehaviorSubject } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('TroopsManagers')
export class TroopsManagers extends Component {
    
    public static Instance:TroopsManagers | null = null;
    
    public onHeroesUpdated$: BehaviorSubject<HeroData[]> = new BehaviorSubject<HeroData[]>([]);

    private _summonedHeroes:HeroData[] = []
    public get summonedHeroes(){
        return this._summonedHeroes;
    }

    protected onLoad(): void {
        TroopsManagers.Instance = this;
    }

    public addHeroToSummonedArray(newHero:HeroData){
        console.log(`added: ${newHero.name}`);
        this._summonedHeroes.push(newHero);
        this.onHeroesUpdated$.next(this._summonedHeroes);
    }

    /** Kills every summoned hero by erasing them. But why would you do this? :-(
     */
    public killSummonedHeroes(){
        this._summonedHeroes = [];
        this.onHeroesUpdated$.next(this._summonedHeroes);
    }
}


