import {Component, OnInit} from '@angular/core';
import {Observable, take, tap} from "rxjs";
import {AppState} from "../../store/app.state";
import {Select, Store} from "@ngxs/store";
import {RoomService} from "../../services/room.service";
import {IUser} from "../../interfaces/user.interface";
import {MatDialog} from "@angular/material/dialog";
import {ChangeNameModalComponent} from "./change-name-modal/change-name-modal.component";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {IRoom} from "../../interfaces/room.interface";
import {SetIsGameOver, UpdateParticipant, UpdateResult, UpdateRoom} from "../../store/app.actions";
import {Router} from "@angular/router";
import {IParticipant} from "../../interfaces/participant.interface";

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
    @Select(AppState.user) user$: Observable<IUser>
    @Select(AppState.userParticipant) participant$: Observable<IParticipant>
    @Select(AppState.gameResult) gameResult$: Observable<null | number>
    room$: Observable<IRoom | undefined>

    constructor(
        public dialog: MatDialog,
        private roomService: RoomService,
        private afs: AngularFirestore,
        private store: Store,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.roomService.enterRoom();
        this.room$ = this.afs.doc<IRoom>(`room/${this.store.selectSnapshot(AppState.room)?.key}`)
            .valueChanges().pipe(tap(room => {
                if (!room) {
                    this.router.navigate(['']);
                } else {
                    this.store.dispatch(new UpdateRoom(room))
                }
            }))
    }

    changeName() {
        this.dialog.open(ChangeNameModalComponent);
    }

    leaveRoom() {
        this.roomService.leaveRoom()
    }

    vote(value: number) {
        this.roomService.vote(value);
    }

    showResults() {
        this.store.dispatch(new SetIsGameOver(true)).pipe(take(1)).subscribe(() => {
            const participantsSnapshot = this.store.selectSnapshot(AppState.room)?.participants;
            let sum: number = 0;

            if (participantsSnapshot) {
                let votes: number[] = [];

                participantsSnapshot.map(p => {
                    if (p.vote) {
                        votes.push(p.vote);
                    }
                })

                for (var i = 0; i < votes.length; i++) {
                    sum += votes[i];
                }

                const result = sum / votes.length;

                this.store.dispatch(new UpdateResult(+result.toFixed(2)))
            }

            const roomSnapshot = this.store.selectSnapshot(AppState.room);

            if (roomSnapshot) {
                this.afs.doc<IRoom>(`room/${roomSnapshot?.key}`).update({
                    ...roomSnapshot
                })
            }
        })
    }

    newGame() {
        this.store.dispatch(new SetIsGameOver(false)).pipe(take(1)).subscribe(() => {
            const participantsSnapshot = this.store.selectSnapshot(AppState.room)?.participants;

            if (participantsSnapshot) {
                participantsSnapshot.map(p => {
                    this.store.dispatch(new UpdateParticipant({...p, vote: null}));
                    this.store.dispatch(new UpdateResult(null))
                })

                const roomSnapshot = this.store.selectSnapshot(AppState.room);

                if (roomSnapshot) {
                    this.afs.doc<IRoom>(`room/${roomSnapshot?.key}`).update(roomSnapshot)
                }
            }
        })
    }
}
