
export interface BuildingData{
    id:string;
    name:string;
    description:string;
    cost:number;
    settings:{
        hireSlots: number;
        summonableHeroes: HeroData[];
    }
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

export interface StateData{
    currency:number;
    buildings: Array<string>;
    heroes: Array<string>;
}

export interface BuildingsJsonData{
    buildings: Array<BuildingData>;
}

export interface HeroesJsonData{
    heroes: Array<HeroData>;
}

export interface InitialStateJsonData{
    state:StateData;
}
