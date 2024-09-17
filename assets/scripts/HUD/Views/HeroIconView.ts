import { _decorator, CCString, Component, Node, Sprite } from 'cc';
import { OnIconSpritesSetArgs, HeroIconViewModel } from '../ViewModels/HeroIconViewModel';
import { Subscription } from 'rxjs';
import { HeroData } from '../../GameData';
const { ccclass, property } = _decorator;

@ccclass('HeroIconView')
export class HeroIconView extends Component {
    
    @property(Node)
    private iconSelectedFrame:Node | null = null;
    @property(Sprite)
    private heroIconSprite:Sprite | null = null;
    @property(Sprite)
    private rankIconSprite:Sprite | null = null;
    @property(Sprite)
    private elementIconSprite:Sprite | null = null;

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

        const onIconSpritesSetArgsSubscription = viewModel.onIconSpritesSet$.subscribe((onIconSpritesSetArgs:OnIconSpritesSetArgs) =>{
            if(this.heroIconSprite){
                this.heroIconSprite.spriteFrame = onIconSpritesSetArgs.heroSpriteFrame;
            }
            if(this.rankIconSprite){
                this.rankIconSprite.spriteFrame = onIconSpritesSetArgs.rankSpriteFrame;
            }
            if(this.elementIconSprite){
                this.elementIconSprite.spriteFrame = onIconSpritesSetArgs.elementSpriteFrame;
            }
        });
        this._subscriptionsArray.push(onIconSpritesSetArgsSubscription);

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

    public init(iconHeroData:HeroData){
        // console.log(`Init icon for ${iconHeroData.name}`);
        const viewModel = this.getViewModel();
        viewModel.setUpIcon(iconHeroData);
    }
}

