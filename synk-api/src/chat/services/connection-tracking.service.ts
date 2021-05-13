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

@Injectable()
export class ConnectionTrackingService {

    private readonly logger = new Logger(ConnectionTrackingService.name);

    clients = new Map<string, { memberId: string, client: socketio.Socket }[]>();
    globallyBannedIps = new Map<string, string>();

    memberInRoomTracker = new Map<string, { roomId: string, socketId: string }[]>(); // [ key => roomId, value => { memberId, socketId } ]

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

        // client.conn.on('heartbeat', () => {
        //     console.log('heartbeat received');
        //     const ip = this.getIpFromSocket(client);
        //     const memberId = userData.id;
        //     const trackingForIp = this.clients.get(ip);
        //     const trackingForMember = trackingForIp.find(it => it.memberId === memberId);
        //     console.log(
        //         `heartbeat from ${ip} 
        //          who is memberID ${trackingForMember.memberId} 
        //          and socketid ${trackingForMember.client.id}`
        //     );
        // });
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
            throw new WsException('authentication error');
        }
    }

    isClientInRoom = (client: socketio.Socket, roomId: string) => {
        const memberId = this.getMemberId(client);
        const roomsOfMember = this.memberInRoomTracker.get(memberId);
        const socketId = client.id;

        if (!roomsOfMember) {
            return false;
        }

        return  roomsOfMember.some(e => e.roomId === roomId && e.socketId === socketId);
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
            this.logger.log("memberLeavesRoom updatedMemberList")
            this.logger.log(this.memberInRoomTracker)
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
            throw new WsException('authentication error');
        }
    }

    private throwIfBanned(client: socketio.Socket) {
        const clientIp = this.getIpFromSocket(client);
        if (this.globallyBannedIps.get(clientIp)) {
            this.logger.log(`Denied connection for banned IP [${clientIp}]`);
            throw new WsException('InternalServerErrorException');
        }
    }
}
