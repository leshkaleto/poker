import {Component} from '@angular/core';
import {Select, Store} from "@ngxs/store";
import {AppState} from "../../store/app.state";
import {Observable, withLatestFrom} from "rxjs";
import {IRoom} from "../../interfaces/room.interface";
import {Router} from "@angular/router";
import {CreateRoom} from "../../store/app.actions";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    @Select(AppState.username) username$: Observable<string | null>;
    @Select(AppState.isAuthenticated) isAuthenticated$: Observable<boolean>
    @Select(AppState.room) room$: Observable<IRoom | null>
    createLoad: boolean = false;

    constructor(
        private store: Store,
        private router: Router
    ) {
    }

    create() {
        this.createLoad = true;

        this.store.dispatch(new CreateRoom()).pipe(withLatestFrom(this.room$)).subscribe(([_, room]) => {
            this.createLoad = false;

            if (room?.key) {
                this.router.navigate(['room', room.key])
            }
        })
    }
}
