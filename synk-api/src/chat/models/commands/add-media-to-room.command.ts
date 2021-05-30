import SocketIO from "socket.io";
import { Member } from "src/domain/entity";
import { Room } from "../room/room";

export class AddMediaToRoomCommand {
    constructor(
        public readonly url: string,
        public readonly member: Member,
        public readonly room: Room,
        public readonly socket: SocketIO.Socket,
        public readonly socketServer: SocketIO.Server) { }
}
