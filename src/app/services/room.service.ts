import {Injectable} from "@angular/core";
import {IRoom} from "../interfaces/room.interface";
import {Store} from "@ngxs/store";
import {AppState} from "../store/app.state";
import {Observable, of, take} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AddParticipant, RemoveParticipant, Vote} from "../store/app.actions";
import {Router} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    constructor(
        private store: Store,
        private afs: AngularFirestore,
        private router: Router
    ) {
    }

    create(): Observable<IRoom | undefined> {
        const user = this.store.selectSnapshot(AppState.user);
        const key = this.afs.createId();

        if (user?.key) {
            this.afs.collection<IRoom>(`room`).doc(key).set({
                key,
                creatorKey: user.key,
                participants: [],
                cards: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377],
                isGameOver: false,
                gameResult: null
            })

            return this.afs.doc<IRoom>(`room/${key}`).valueChanges()
        } else {
            return of(undefined)
        }
    }

    enterRoom(): void {
        const userSnapshot = this.store.selectSnapshot(AppState.user);
        const participantsSnapshot = this.store.selectSnapshot(AppState.participants);

        if (participantsSnapshot) {
            const isAlreadyParticipant = participantsSnapshot.find(p => p.userKey === userSnapshot?.key);

            if (!isAlreadyParticipant && userSnapshot) {
                this.store.dispatch(new AddParticipant({
                    name: userSnapshot.name,
                    userKey: userSnapshot?.key,
                    vote: null
                })).pipe(take(1)).subscribe(() => {
                    const roomSnapshot = this.store.selectSnapshot(AppState.room);

                    this.afs.doc<IRoom>(`room/${roomSnapshot?.key}`).update({
                        ...roomSnapshot,
                        participants: roomSnapshot?.participants
                    })
                })
            }
        }
    }

    leaveRoom(): void {
        const roomSnapshot = this.store.selectSnapshot(AppState.room);
        const userKey = this.store.selectSnapshot(AppState.user)?.key;
        const isOwner = this.store.selectSnapshot(AppState.isOwner);
        const roomDoc = this.afs.doc<IRoom>(`room/${roomSnapshot?.key}`);

        if (isOwner) {
            roomDoc.delete();
            this.router.navigate(['']);
            return;
        }

        if (userKey) {
            this.store.dispatch(new RemoveParticipant(userKey)).pipe(take(1)).subscribe(() => {
                const roomSnapshot = this.store.selectSnapshot(AppState.room);

                roomDoc.update({
                    ...roomSnapshot,
                    participants: roomSnapshot?.participants
                });

                this.router.navigate(['']);
            })
        }
    }

    vote(vote: number): void {
        const userKey = this.store.selectSnapshot(AppState.user)?.key;

        if (userKey) {
            this.store.dispatch(new Vote({
                userKey,
                vote
            })).pipe(take(1)).subscribe(() => {
                const roomSnapshot = this.store.selectSnapshot(AppState.room);

                this.afs.doc<IRoom>(`room/${roomSnapshot?.key}`).update({
                    ...roomSnapshot,
                    participants: roomSnapshot?.participants
                })
            })
        }
    }
}
