import { Member } from "src/domain/entity";
import { Room } from "../room/room";
import { Socket, Server } from 'socket.io';

export class AddMediaToRoomCommand {
    constructor(
        public readonly url: string,
        public readonly member: Member,
        public readonly room: Room,
        public readonly socket: Socket,
        public readonly socketServer: Server) { }
}
