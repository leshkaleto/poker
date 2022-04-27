import {ActivatedRouteSnapshot, CanActivate, Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {map, mergeMap, Observable, take} from "rxjs";
import {Actions, ofActionDispatched, Select, Store} from "@ngxs/store";
import {AppState} from "../../store/app.state";
import {IRoom} from "../../interfaces/room.interface";
import {UpdateOwner, UpdateRoom, UpdateUser} from "../../store/app.actions";

@Injectable({
    providedIn: 'root'
})
export class RoomGuard implements CanActivate {
    @Select(AppState.isAuthenticated) isAuthenticated$: Observable<boolean>

    constructor(
        private router: Router,
        private afs: AngularFirestore,
        private store: Store,
        private actions$: Actions
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return this.isAuthenticated$.pipe(
            mergeMap(isAuth => {
                if (!isAuth) {
                    return this.actions$.pipe(
                        ofActionDispatched(UpdateUser),
                        mergeMap(() => this.checkRoom(route.params['id']))
                    )
                } else {
                    return this.checkRoom(route.params['id'])
                }
            })
        )
    }

    private checkRoom(roomKey: string): Observable<boolean> {
        return this.afs.doc<IRoom>(`room/${roomKey}`).valueChanges().pipe(
            take(1),
            map(room => {
                if (room) {
                    const user = this.store.selectSnapshot(AppState.user);
                    const isOwner = room.creatorKey === user?.key;
                    this.store.dispatch(new UpdateRoom(room));
                    this.store.dispatch(new UpdateOwner(isOwner))
                    return true
                } else {
                    this.router.navigate([''])
                    return false
                }
            })
        )
    }
}
