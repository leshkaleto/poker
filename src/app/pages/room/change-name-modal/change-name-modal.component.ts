import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup} from "@angular/forms";
import {Select, Store} from "@ngxs/store";
import {AppState} from "../../../store/app.state";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {IUser} from "../../../interfaces/user.interface";
import {UpdateParticipant, UpdateUser} from "../../../store/app.actions";
import {Observable, take} from "rxjs";
import {IParticipant} from "../../../interfaces/participant.interface";
import {IRoom} from "../../../interfaces/room.interface";

@Component({
    selector: 'app-change-name-modal',
    templateUrl: './change-name-modal.component.html',
    styleUrls: ['./change-name-modal.component.scss']
})
export class ChangeNameModalComponent implements OnInit {
    @Select(AppState.userParticipant) userParticipant$: Observable<IParticipant>

    form: FormGroup;
    user: IUser | null;

    constructor(
        public dialogRef: MatDialogRef<ChangeNameModalComponent>,
        private store: Store,
        private afs: AngularFirestore
    ) {
    }

    ngOnInit(): void {
        this.user = this.store.selectSnapshot(AppState.user);
        this.form = new FormGroup({
            name: new FormControl(this.user?.name)
        })
    }

    updateUsername() {
        if (this.user) {
            const user: IUser = {
                ...this.user,
                name: this.form.get('name')?.value
            };

            this.store.dispatch(new UpdateUser(user))

            this.userParticipant$.pipe(take(1)).subscribe(p => {
                this.store.dispatch(new UpdateParticipant({
                    ...p,
                    name: user.name
                }));

                const roomSnapshot = this.store.selectSnapshot(AppState.room);

                if (roomSnapshot) {
                    this.afs.doc<IRoom>(`room/${roomSnapshot?.key}`).update(roomSnapshot)
                }
            })

            this.afs.doc<IUser>(`user/${this.user?.key}`).update(user)
        }
    }
}
