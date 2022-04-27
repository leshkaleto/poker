import {Pipe, PipeTransform} from "@angular/core";
import {Select} from "@ngxs/store";
import {AppState} from "../store/app.state";
import {map, Observable} from "rxjs";
import {IRoom} from "../interfaces/room.interface";

@Pipe({
    name: 'isShowVote',
})
export class IsShowVotePipe implements PipeTransform {
    @Select(AppState.room) room$: Observable<IRoom>

    transform(vote: number | null): Observable<number | string | null> {
        return this.room$.pipe(map(room => {
            if(room.isGameOver) {
                return vote
            } else {
                return '?'
            }
        }))
    }
}
