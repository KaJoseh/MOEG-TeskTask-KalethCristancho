import { Subject } from "rxjs";

export interface IHasProgress{
    onProgressChanged$: Subject<number>;
}


