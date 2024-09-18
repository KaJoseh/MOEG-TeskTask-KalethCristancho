import { _decorator, Component, Label, Node } from 'cc';
import { HeroHallSlotViewModel } from '../ViewModels/HeroHallSlotViewModel';
import { Subscription } from 'rxjs';
import { HeroData } from '../../GameData';
import { HeroIconView } from './HeroIconView';
const { ccclass, property } = _decorator;

@ccclass('HeroHallSlotView')
export class HeroHallSlotView extends Component {

    @property(HeroIconView)
    private heroIconView:HeroIconView | null = null;
    @property(Label)
    private heroNameLabel:Label | null = null;
    @property(Label)
    private heroDescLabel:Label | null = null;
    @property(Label)
    private heroRankLabel:Label | null = null;
    @property(Label)
    private heroTypeLabel:Label | null = null;
    @property(Label)
    private heroCostLabel:Label | null = null;
    @property(Label)
    private heroCooldownLabel:Label | null = null;

    private _viewmodel:HeroHallSlotViewModel | null = null;
    public getViewModel():HeroHallSlotViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new HeroHallSlotViewModel();
        }
        return this._viewmodel;
    }

    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        const viewModel = this.getViewModel();

        const onHeroHallSlotUpdatedSubscription = viewModel.onHeroHallSlotUpdated$.subscribe((heroSlotData:HeroData) =>{
            if(this.heroIconView){
                this.heroIconView.init(heroSlotData);
            }
            if(this.heroNameLabel){
                this.heroNameLabel.string = heroSlotData.name;
            }
            if(this.heroDescLabel){
                this.heroDescLabel.string = heroSlotData.description;
            }
            if(this.heroRankLabel){
                this.heroRankLabel.string = `Rank:${heroSlotData.rank.toUpperCase()}`
            }
            if(this.heroTypeLabel){
                this.heroTypeLabel.string = `Type:${heroSlotData.type.toUpperCase()}`
            }
            if(this.heroCostLabel){
                this.heroCostLabel.string = `Cost:${heroSlotData.cost}`
            }
            if(this.heroCooldownLabel){
                this.heroCooldownLabel.string = `Summoning time:${heroSlotData.summonCooldown}`
            }
        });
        this._subscriptionsArray.push(onHeroHallSlotUpdatedSubscription);
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    public setupHeroHallSlot(heroData:HeroData){
        this.getViewModel().setHeroHallSlotDataValues(heroData);
    }

}


