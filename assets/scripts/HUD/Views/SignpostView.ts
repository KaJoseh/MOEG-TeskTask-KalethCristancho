import { _decorator, Button, Component, Label, Node } from 'cc';
import { OnSummonedHeroesUpdatedArgs, SignpostViewModel } from '../ViewModels/SignpostViewModel';
import { Subscription } from 'rxjs';
import { HeroData } from '../../GameData';
const { ccclass, property } = _decorator;

@ccclass('SignpostView')
export class SignpostView extends Component {
    
    @property(Button)
    private signpostButton:Button | null = null;
    @property(Label)
    private signpostHeroesCountLabel:Label | null = null;

    private _viewmodel:SignpostViewModel | null = null;
    public getViewModel():SignpostViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new SignpostViewModel();
        }
        return this._viewmodel;
    }

    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        const viewModel = this.getViewModel();

        const summonedHeroesUpdateSubscription = viewModel.onSummonedHeroesUpdated$.subscribe((onSummonedHeroesUpdateArgs:OnSummonedHeroesUpdatedArgs) => {
            if(this.signpostButton){
                this.signpostButton.interactable = onSummonedHeroesUpdateArgs.enableSignpost;
            }
            if(this.signpostHeroesCountLabel){
                this.signpostHeroesCountLabel.string = onSummonedHeroesUpdateArgs.summonedHeroesCount.toString();

                const herousCountLabelParent = this.signpostHeroesCountLabel.node.parent;
                if(herousCountLabelParent){
                    herousCountLabelParent.active = onSummonedHeroesUpdateArgs.enableSignpost;
                }
            }
        });
        this._subscriptionsArray.push(summonedHeroesUpdateSubscription);
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    public handleSummonedHeroesUpdate(summonedHeroes:HeroData[]){
        this.getViewModel().handleSummonedHeroes(summonedHeroes);
    }
}


