import { _decorator, Component, Node } from 'cc';
import { BuildingClassJSON, HeroesJSON, JsonLoader } from './JsonLoader';
const { ccclass, property } = _decorator;

@ccclass('JsonLoaderTest')
export class JsonLoaderTest extends Component {

    start() {
        JsonLoader.GetObjectFromJson<HeroesJSON>('settings/heroes', (result: HeroesJSON) => {
            console.log("--- Heroes from JSON ---");
            result.heroes.forEach(hero => {
                console.log(hero.name);
            });
        });

        JsonLoader.GetObjectFromJsonByKey<BuildingClassJSON[]>('settings/buildings', "buildings", (result: BuildingClassJSON[]) => {
            console.log("--- Buildings from JSON ---");
            result.forEach(building => {
                console.log(`Building Name:${building.name} | Cost:${building.cost} | Slots:${building.settings.hireSlots}`);
            });
        });
    }
}