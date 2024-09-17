import { _decorator, Component, Node, Sprite } from 'cc';
import { SummoningSlotViewModel } from '../ViewModels/SummoningSlotViewModel';
import { HeroIconView } from './HeroIconView';
import { HeroData } from '../../GameData';
import { Subscription } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('SummoningSlotView')
export class SummoningSlotView extends Component {
    
    @property(HeroIconView)
    private heroIconView:HeroIconView | null = null;
    @property(Node)
    private slotValuesContainer:Node | null = null;
    @property(Sprite)
    private progressBarSprite:Sprite | null = null;

    private _viewmodel:SummoningSlotViewModel | null = null;
    public getViewModel():SummoningSlotViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new SummoningSlotViewModel();
        }
        return this._viewmodel;
    }

    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        const viewModel = this.getViewModel();
        
        const enableSlotValuesContainerSubscription = viewModel.displaySlotValues$.subscribe((value: boolean)=>{
            if(this.slotValuesContainer){
                this.slotValuesContainer.active = value;
            }
        });
        this._subscriptionsArray.push(enableSlotValuesContainerSubscription);

        const onProgressChangedSubscription = viewModel.onProgressChanged$.subscribe((progressNormalized:number) =>{
            if(this.progressBarSprite){
                this.progressBarSprite.fillRange = progressNormalized;
            }
        });
        this._subscriptionsArray.push(onProgressChangedSubscription);

        const onSlotHeroDataSetSubscription = viewModel.onSlotHeroDataSet$.subscribe((slotHeroData:HeroData) =>{
            if(this.heroIconView){
                this.heroIconView.getViewModel().setUpIcon(slotHeroData);
            }
        });
        this._subscriptionsArray.push(onSlotHeroDataSetSubscription);
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    public Init(slotHeroData: HeroData){
        const viewModel = this.getViewModel();
        this.heroIconView?.init(slotHeroData);
    }
}


