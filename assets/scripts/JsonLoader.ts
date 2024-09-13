import { _decorator, Component, JsonAsset, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

export class JsonLoader{

    static GetObjectFromJson<T>(resourcesPath:string, callback:(result: T) => void){
        resources.load<JsonAsset>(resourcesPath, function(err, jsonAsset){
            if (err) {
                console.error("Failed to load json:", err);
                return;
            }

            let jsonData:any;
            jsonData = JsonAsset.deserialize(jsonAsset.json);
            callback(jsonData);
        });
    }

    static GetObjectFromJsonByKey<T>(resourcesPath:string, keyValue:string, callback:(result: T) => void){
        resources.load<JsonAsset>(resourcesPath, function(err, jsonAsset){
            if (err) {
                console.error("Failed to load json:", err);
                return;
            }

            let jsonData:any;
            jsonData = JsonAsset.deserialize(jsonAsset.json);
            let keyObject = jsonData[keyValue as keyof typeof jsonData];
            callback(keyObject);
        });
    }
}
export class HeroesJSON{
    heroes!: Array<{
        id:string;
        name: string;
        description:string;
        cost:number;
        summonCooldown:number;
        type:string;
        rank:string;
    }>;
}

export class BuildingClassJSON{
    id!:string;
    name!:string;
    description!:string;
    cost!:number;
    settings!:{
        hireSlots: number;
    }
}
