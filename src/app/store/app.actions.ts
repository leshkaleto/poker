import {IRoom} from "../interfaces/room.interface";
import {IUser} from "../interfaces/user.interface";
import {IParticipant} from "../interfaces/participant.interface";

export class Login {
    static readonly type = '[Auth] Login';
}

export class Logout {
    static readonly type = '[Auth] Logout';
}

export class CreateRoom {
    static readonly type = '[Room] Create Room';
}

export class UpdateRoom {
    static readonly type = '[Room] Update Room';

    constructor(public room: IRoom) {
    }
}

export class UpdateUser {
    static readonly type = '[User] Update User';

    constructor(public user: IUser) {
    }
}

export class AddParticipant {
    static readonly type = '[Room] Add Participant'

    constructor(public participant: IParticipant) {
    }
}

export class RemoveParticipant {
    static readonly type = '[Room] Remove Participant'

    constructor(public userKey: string) {
    }
}

export class UpdateParticipant {
    static readonly type = '[Room] Update Participant'

    constructor(public participant: IParticipant) {
    }
}

export class UpdateOwner {
    static readonly type = '[Owner] Update Owner'

    constructor(public isOwner: boolean) {
    }
}

export class Vote {
    static readonly type = '[User] Vote'

    constructor(public participant: { userKey: string, vote: number | null }) {
    }
}

export class SetIsGameOver {
    static readonly type = '[Game] Update'

    constructor(public isGameOver: boolean) {
    }
}

export class UpdateResult {
    static readonly type = '[Game] Update Result'

    constructor(public result: number | null) {
    }
}
