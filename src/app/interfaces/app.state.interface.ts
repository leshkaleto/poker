import {IUser} from "./user.interface";
import {IRoom} from "./room.interface";

export interface IAppState {
    user: IUser | null;
    room: IRoom | null;
    isRoomOwner: boolean | null
}
