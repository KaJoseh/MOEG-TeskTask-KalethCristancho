import { _decorator, Component, JsonAsset, log, Node, resources, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestComponent')
export class TestComponent extends Component {    

    start() {
        //Tween animation testing
        let originalNodeScale = this.node.getScale();
        let tweenTest = tween(this.node).repeatForever(
            tween()
                .to(1.5,{scale: new Vec3(2,2, this.node.getScale().z)}, 
                {
                    easing:"elasticOut",
                    onComplete: () => {log("Completed!")},
                }
            )
                .to(1.5,{scale: originalNodeScale}, {easing: "cubicIn"})
        );
        tweenTest.start();  

        
        //Json test
        resources.load<JsonAsset>('settings/heroes', function(err, jsonAsset){
            if (err) {
                console.error("Failed to load json:", err);
                return;
            }

            let example = JsonAsset.deserialize(jsonAsset.json) as HeroJsonInterface;
            log("total heroes=" + example.heroes.length);
            example.heroes.forEach(element => {
                console.log("Hero #" + example.heroes.indexOf(element) + " is " + element.name);
            });
        });
    }

    update(deltaTime: number) {
        
    }
    
}

export interface HeroJsonInterface{
    heroes:HeroClass[];
}

export interface HeroInterface {
    id:string;
    name: string;
    description:string;
    cost:number;
    summonCooldown:number;
    type:string;
    rank:string;
}

class HeroClass{
    id:string;
    name: string;
    description:string;
    cost:number;
    summonCooldown:number;
    type:string;
    rank:string;

    constructor(id:string, name:string, description:string, cost:number, summonCooldown:number, type:string, rank:string){
        this.id = id;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.summonCooldown = summonCooldown;
        this.type = type;
        this.rank = rank;
    }
}


