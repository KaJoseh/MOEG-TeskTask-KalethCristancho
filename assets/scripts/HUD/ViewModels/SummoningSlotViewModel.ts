import { SpriteFrame } from "cc";

export class SummoningSlotViewModel{
    
    constructor(){

    }

}

export class SummoningSlotSettings{
    heroSpriteFrame: SpriteFrame | null = null;
    rankSpriteFrame: SpriteFrame | null = null;
    elementSpriteFrame: SpriteFrame | null = null;
    summonProgress:number = 0

    constructor(heroSprite: SpriteFrame, rankSprite: SpriteFrame, elementSprite: SpriteFrame){
        this.heroSpriteFrame = heroSprite;
        this.rankSpriteFrame = rankSprite;
        this.elementSpriteFrame = elementSprite;
    }
}

