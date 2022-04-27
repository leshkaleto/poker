import {Pipe, PipeTransform} from "@angular/core";
import {Select} from "@ngxs/store";
import {AppState} from "../store/app.state";
import {map, Observable} from "rxjs";
import {IParticipant} from "../interfaces/participant.interface";

@Pipe({
    name: 'isVotedCard',
})
export class IsVotedCardPipe implements PipeTransform {
    @Select(AppState.userParticipant) userParticipant$: Observable<IParticipant>

    transform(vote: number): Observable<boolean> {
        return this.userParticipant$.pipe(map(p => {
            return p.vote === vote
        }))
    }
}
