import {Action, Selector, State, StateContext, Store} from "@ngxs/store";
import {Injectable} from "@angular/core";
import {UserService} from "../services/user.service";
import {RoomService} from "../services/room.service";
import {
    AddParticipant,
    CreateRoom,
    Login,
    Logout,
    RemoveParticipant,
    SetIsGameOver,
    UpdateOwner,
    UpdateParticipant, UpdateResult,
    UpdateRoom,
    UpdateUser,
    Vote
} from "./app.actions";
import {IAppState} from "../interfaces/app.state.interface";
import {LocalStorageService} from "ngx-webstorage";
import {map, Observable, take} from "rxjs";
import {IUser} from "../interfaces/user.interface";
import {IRoom} from "../interfaces/room.interface";
import {IParticipant} from "../interfaces/participant.interface";
import {append, patch, removeItem, updateItem} from "@ngxs/store/operators";

export const STORAGE_FIELD_USER_KEY = 'rev-poker-userkey';

@State<IAppState>({
    name: 'app',
    defaults: {
        user: null,
        room: null,
        isRoomOwner: null
    }
})
@Injectable()
export class AppState {
    @Selector()
    static isAuthenticated(state: IAppState): boolean {
        return !!state.user?.key;
    }

    @Selector()
    static username(state: IAppState): string | undefined {
        return state.user?.name
    }

    @Selector()
    static user(state: IAppState): IUser | null {
        return state.user
    }

    @Selector()
    static room(state: IAppState): IRoom | null {
        return state.room
    }

    @Selector()
    static roomCreatorKey(state: IAppState): string | undefined {
        return state.room?.creatorKey
    }

    @Selector()
    static participants(state: IAppState): IParticipant[] | undefined {
        return state.room?.participants
    }

    @Selector()
    static userParticipant(state: IAppState): IParticipant | undefined {
        return state.room?.participants.find(p => p.userKey === state.user?.key)
    }

    @Selector()
    static gameResult(state: IAppState): number | null | undefined {
        return state.room?.gameResult
    }

    @Selector()
    static isOwner(state: IAppState): boolean | null {
        return state?.isRoomOwner
    }

    constructor(
        private userService: UserService,
        private roomService: RoomService,
        private storageService: LocalStorageService,
        private store: Store
    ) {
    }

    @Action(Login)
    login() {
        let userKey: string = this.storageService.retrieve(STORAGE_FIELD_USER_KEY);

        if (!userKey) {
            this.userService.createUser().pipe(take(1)).subscribe(user => {
                if (user) {
                    this.storageService.store(STORAGE_FIELD_USER_KEY, user.key);
                    this.store.dispatch(new UpdateUser(user));
                } else {
                    throw new Error('Can\t create user!')
                }
            });
        } else {
            this.userService.isExistInDb(userKey).pipe(take(1)).subscribe(user => {
                if (!user) {
                    this.store.dispatch(new Logout())
                } else {
                    this.store.dispatch(new UpdateUser(user))
                }
            })
        }
    }

    @Action(Logout)
    logout(ctx: StateContext<IAppState>) {
        this.storageService.clear(STORAGE_FIELD_USER_KEY)
        ctx.setState({user: null, room: null, isRoomOwner: null})
    }

    @Action(CreateRoom)
    createRoom(): Observable<IRoom | null> {
        return this.roomService.create().pipe(take(1), map(room => {
            if (room) {
                this.store.dispatch(new UpdateRoom(room))
                return room
            } else {
                return null
            }
        }))
    }

    @Action(UpdateRoom)
    updateRoom(ctx: StateContext<IAppState>, action: UpdateRoom) {
        ctx.patchState({
            room: action.room
        })
    }

    @Action(UpdateUser)
    updateUser(ctx: StateContext<IAppState>, action: UpdateUser) {
        ctx.patchState({
            user: action.user
        })
    }

    @Action(AddParticipant)
    addParticipant(ctx: StateContext<any>, action: AddParticipant) {
        ctx.setState(patch({
            room: patch({
                participants: append<IParticipant>([action.participant])
            })
        }))
    }

    @Action(UpdateParticipant)
    updateParticipant(ctx: StateContext<any>, action: UpdateParticipant) {
        ctx.setState(patch({
            room: patch({
                participants: updateItem<IParticipant>(
                    user => user?.userKey === action.participant.userKey,
                    action.participant
                )
            })
        }))
    }

    @Action(RemoveParticipant)
    removeParticipant(ctx: StateContext<any>, action: RemoveParticipant) {
        ctx.setState(patch({
            room: patch({
                participants: removeItem<IParticipant>(user => user?.userKey === action.userKey)
            })
        }));
    }

    @Action(UpdateOwner)
    updateOwner(ctx: StateContext<IAppState>, action: UpdateOwner) {
        ctx.patchState({
            isRoomOwner: action.isOwner
        })
    }

    @Action(Vote)
    vote(ctx: StateContext<any>, action: Vote) {
        ctx.setState(patch({
            room: patch({
                participants: updateItem<IParticipant>(
                    user => user?.userKey === action.participant.userKey,
                    patch({vote: action.participant.vote}))
            })
        }));
    }

    @Action(SetIsGameOver)
    setIsGameOver(ctx: StateContext<any>, action: SetIsGameOver) {
        if (action.isGameOver) {
            ctx.setState(patch({
                room: patch({
                    isGameOver: action.isGameOver
                })
            }))
        } else {
            ctx.setState(patch({
                room: patch({
                    isGameOver: action.isGameOver,
                    participants: updateItem(participant => {
                        return !!participant
                    }, patch({
                        vote: null
                    }))
                })
            }))
        }
    }

    @Action(UpdateResult)
    updateResult(ctx: StateContext<any>, action: UpdateResult) {
        ctx.setState(patch({
            room: patch({
                gameResult: action.result
            })
        }))
    }
}
