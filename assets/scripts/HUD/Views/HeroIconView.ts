import { _decorator, CCString, Component, Node, Sprite, SpriteComponent, SpriteFrame, SpriteRenderer } from 'cc';
import { HeroIconSettings, HeroIconViewModel } from '../ViewModels/HeroIconViewModel';
import { Subscription } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('HeroIconView')
export class HeroIconView extends Component {
    
    @property(Node)
    private iconSelectedFrame:Node | null = null;
    @property(Sprite)
    private heroIconSpriteRenderer:Sprite | null = null;
    @property(Sprite)
    private rankIconSpriteRenderer:Sprite | null = null;
    @property(Sprite)
    private elementIconSpriteRenderer:Sprite | null = null;

    private _viewmodel:HeroIconViewModel | null = null;
    public getViewModel():HeroIconViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new HeroIconViewModel();
        }
        return this._viewmodel;
    }

    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        const viewModel = this.getViewModel();

        const iconSettingsSubscription = viewModel.iconSettings$.subscribe((heroIconSettings:HeroIconSettings) =>{
            if(this.heroIconSpriteRenderer){
                this.heroIconSpriteRenderer.spriteFrame = heroIconSettings.heroSpriteFrame;
            }
            if(this.rankIconSpriteRenderer){
                this.rankIconSpriteRenderer.spriteFrame = heroIconSettings.rankSpriteFrame;
            }
            if(this.elementIconSpriteRenderer){
                this.elementIconSpriteRenderer.spriteFrame = heroIconSettings.elementSpriteFrame;
            }
        });
        this._subscriptionsArray.push(iconSettingsSubscription);

        const iconSelectedSubscription = viewModel.isSelected$.subscribe((selected:boolean) => {
            if(this.iconSelectedFrame){
                this.iconSelectedFrame.active = selected;
            }
        });
        this._subscriptionsArray.push(iconSelectedSubscription);
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    public Init(heroId:string, rankId:string, elementId: string, cost:number){
        console.log(`Init icon for ${heroId}`)
        const viewModel = this.getViewModel();
        viewModel.setUpIcon(heroId, rankId, elementId, cost);
    }
}

