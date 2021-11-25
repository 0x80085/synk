import * as socketio from 'socket.io';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    WsException
} from '@nestjs/websockets';
import { Repository } from 'typeorm';

import { SerializedUserData } from '../../auth/local.serializer';
import { Member } from '../../domain/entity/Member';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { MessageTypes } from '../gateways/message-types.enum';

@Injectable()
export class ConnectionTrackingService {

    private readonly logger = new Logger(ConnectionTrackingService.name);

    /**
     *  [ key => ipAddress, value => { MemberId, socket } ]
     */
    clients = new Map<string, { memberId: string, client: socketio.Socket }[]>();
    globallyBannedIps = new Map<string, string>();

    /**
     *  [ key => memberId, value => { roomId, socketId } ]
     */
    memberInRoomTracker = new Map<string, { roomId: string, socketId: string }[]>();

    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,) { }

    getIpFromSocket = (client: socketio.Socket) => client.handshake.headers['x-forwarded-for'] || client.handshake.address
    getIpFromRequest = (req: any) => req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    trackMemberConnection(client: socketio.Socket) {
        const clientIp = this.getIpFromSocket(client);
        this.logger.log(`Connection incoming [${clientIp}]`);

        this.throwIfBanned(client);
        this.throwIfNotAuthenicated(client);

        const userData = (client.handshake as any).session.passport.user as SerializedUserData;
        const { id } = userData;

        if (this.clients.has(clientIp)) {
            this.saveToExistingIPTrackingRecord(id, clientIp, client);
        } else {
            this.createNewIPTrackingRecord(id, clientIp, client);
        }
    }

    getSocketByMemberId(memberId: string): socketio.Socket {
        // TODO can we make this better? Index on memberId also or not use memberid?
        for (const [, connections] of this.clients) {
            const connection = connections.find(connection => connection.memberId === memberId);
            if (connection) {
                return connection.client;
            }
        }
        return null;
    }

    getSocketsByMemberIdAndIpAddress(memberId: string, ip: string): socketio.Socket[] {
        // TODO can we make this better? Index on memberId also or not use memberid?
        for (const [, connections] of this.clients) {
            const connection = connections
                .filter(connection =>
                    connection.memberId === memberId
                    && this.getIpFromSocket(connection.client) === ip
                );
            return connection.map(({ client }) => (client));
        }
    }

    async getMemberBySocket(socket: socketio.Socket): Promise<Member> {
        try {
            const memberId = this.getMemberId(socket);
            return await this.memberRepository.findOneOrFail(memberId);
        } catch (error) {
            throw new WsException(MessageTypes.NOT_AUTHENTICATED);
        }
    }

    isClientInRoom(client: socketio.Socket, roomId: string) {
        const memberId = this.getMemberId(client);
        const ipaddress = this.getIpFromSocket(client);
        const roomsOfMember = this.memberInRoomTracker.get(memberId);
        const socketId = client.id;

        if (!roomsOfMember) {
            return false;
        }

        const otherConnections = this.clients.get(ipaddress)
            .filter(c => c.memberId === memberId && c.client.id !== socketId)
            .map(conn => ({ client: conn.client, isInRoom: !!conn.client.rooms[roomId] }))

        const hasOtherActiveSockets = otherConnections.filter(conn => conn.isInRoom && conn.client.connected)

        // remove stale 

        // join if all stale removed and none left

        return roomsOfMember.some(e => e.roomId === roomId && e.socketId === socketId);
    }

    memberJoinsRoom(client: socketio.Socket, roomId: string) {
        const memberId = this.getMemberId(client)
        const roomsOfMember = this.memberInRoomTracker.get(memberId)
        const socketId = client.id;

        if (!roomsOfMember) {
            this.memberInRoomTracker.set(memberId, [{ roomId, socketId }]);
        } else {
            roomsOfMember.push({ roomId, socketId })
        }
    }

    memberLeavesRoom(client: socketio.Socket, roomId: string) {
        const memberId = this.getMemberId(client)
        const roomsOfMember = this.memberInRoomTracker.get(memberId)
        const socketId = client.id;

        if (this.isClientInRoom(client, roomId)) {
            const updatedRoomList = roomsOfMember.filter(mem => mem.roomId !== roomId && mem.socketId !== socketId);
            this.memberInRoomTracker.set(memberId, updatedRoomList);
            this.logger.log("memberLeavesRoom, updated MemberList")
        }
    }

    memberDisconnects(client: socketio.Socket) {
        try {
            const socketId = client.id;
            const ipAddress = this.getIpFromSocket(client);
            const memberId = this.getMemberId(client);

            const trackRecords = this.clients.get(ipAddress);
            const updateTrackRecods = trackRecords.filter(entry => entry.client.id !== socketId)

            const roomTrackRecords = this.memberInRoomTracker.get(memberId);
            if (!!roomTrackRecords) {
                const updatedRoomTrackRecords = roomTrackRecords.filter(entry => entry.socketId !== socketId);
                this.memberInRoomTracker.set(memberId, updatedRoomTrackRecords);
            }

            this.clients.set(ipAddress, updateTrackRecods);

            this.logger.log(`${ipAddress}:${socketId} was removed from tracker`);

        } catch (error) {
            this.logger.error("Something went wrong trying to update connection track records:", error)
            console.log(error)
        }

    }

    private getMemberId = (client: socketio.Socket): string => ((client.handshake as any).session.passport.user.id);

    private createNewIPTrackingRecord(memberId: string, clientIp: string, client: socketio.Socket) {
        this.clients.set(clientIp, [{ memberId, client }]);
    }

    private saveToExistingIPTrackingRecord(memberId: string, clientIp: string, client: socketio.Socket) {
        const existingEntry = this.clients.get(clientIp);
        const newEntry = { memberId, client };
        this.clients.set(clientIp, [...existingEntry, newEntry]);
    }

    private throwIfNotAuthenicated(client: socketio.Socket) {

        const hasValidSessionData = AuthenticatedGuard.validateSession(client.handshake);

        if (!hasValidSessionData) {
            const clientIp = this.getIpFromSocket(client)
            this.logger.log(`Denied connection for unauthorized IP [${clientIp}]`);
            throw new WsException(MessageTypes.NOT_AUTHENTICATED);
        }
    }

    private throwIfBanned(client: socketio.Socket) {
        const clientIp = this.getIpFromSocket(client);
        if (this.globallyBannedIps.get(clientIp)) {
            this.logger.log(`Denied connection for banned IP [${clientIp}]`);
            throw new WsException(MessageTypes.INTERNAL_SERVER_ERROR);
        }
    }
}
