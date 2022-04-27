import {Injectable} from "@angular/core";
import {IUser} from "../interfaces/user.interface";
import {Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Injectable({
    providedIn: 'root'
})
export abstract class UserService {
    constructor(
        private afs: AngularFirestore
    ) {
    }

    createUser(): Observable<IUser | undefined> {
        const key = this.afs.createId();
        this.afs.collection<IUser>(`user`).doc(key).set({
            name: 'Player',
            key
        })

        return this.afs.doc<IUser>(`user/${key}`).valueChanges()
    }

    isExistInDb(userKey: string): Observable<IUser | undefined> {
        return this.afs.doc<IUser>(`user/${userKey}`).valueChanges()
    }
}
