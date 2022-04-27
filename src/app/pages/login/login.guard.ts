import {Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import {map, mergeMap, Observable, take} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {IRoom} from "../../interfaces/room.interface";
import {AppState} from "../../store/app.state";
import {Actions, ofActionDispatched, Select, Store} from "@ngxs/store";
import {UpdateUser} from "../../store/app.actions";

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    @Select(AppState.isAuthenticated) isAuthenticated$: Observable<boolean>

    constructor(
        private afs: AngularFirestore,
        private store: Store,
        private router: Router,
        private actions$: Actions
    ) {
    }

    canActivate(): Observable<boolean> {
        return this.isAuthenticated$.pipe(
            mergeMap(isAuth => {
                if (!isAuth) {
                    return this.actions$.pipe(
                        ofActionDispatched(UpdateUser),
                        mergeMap(() => {
                            return this.checkInRoom();
                        })
                    )
                } else {
                    return this.checkInRoom();
                }
            })
        )
    }

    private checkInRoom(): Observable<boolean> {
        const user = this.store.selectSnapshot(AppState.user);
        return this.afs.collection<IRoom>('room').valueChanges().pipe(take(1), map(allRoom =>{
            const memberOfRooms: IRoom[] = allRoom.filter(room => room.participants.find(p => p.userKey === user?.key))

            if (memberOfRooms.length) {
                this.router.navigate(['/room', memberOfRooms[0].key])
                return false
            } else {
                return true
            }
        }));
    }
}
