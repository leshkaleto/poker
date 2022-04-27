import {IParticipant} from "./participant.interface";

export interface IRoom {
    key: string
    creatorKey: string
    participants: IParticipant[]
    cards: number[]
    isGameOver: boolean
    gameResult: number | null
}
