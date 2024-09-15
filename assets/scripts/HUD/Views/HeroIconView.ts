import { _decorator, CCString, Component, Node, Sprite, SpriteComponent, SpriteFrame, SpriteRenderer } from 'cc';
import { HeroIconSettings, HeroIconViewModel } from '../ViewModels/HeroIconViewModel';
import { Subscription } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('HeroIconView')
export class HeroIconView extends Component {
    
    @property(Sprite)
    private heroIconSpriteRenderer:Sprite | null = null;

    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        const viewModel = this.getViewModel();

        const iconSettingsSubscription = viewModel.iconSettings$.subscribe((heroIconSettings:HeroIconSettings) =>{
            if(this.heroIconSpriteRenderer){
                this.heroIconSpriteRenderer.spriteFrame = heroIconSettings.heroSpriteFrame;
            }
        });
        this._subscriptionsArray.push(iconSettingsSubscription);
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    private _viewmodel:HeroIconViewModel | null = null;
    public getViewModel():HeroIconViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new HeroIconViewModel();
        }
        return this._viewmodel;
    }

    public Init(heroId:string){
        console.log(`Init icon for ${heroId}`)
        const viewModel = this.getViewModel();
        viewModel.setUpIcon(heroId);
    }
}

