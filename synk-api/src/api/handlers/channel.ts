import { getConnection } from 'typeorm';

import { Channel } from '../../domain/entity/Channel';
import { User } from '../../domain/entity/User';
import { RoomService } from '../../socket/services/room-service';

export async function addChannel(username: string, channelName: string, description: string) {
  const connection = getConnection();

  const user = await connection.manager.findOneOrFail(User, {
    where: {
      username
    }
  });
  const chan = Channel.create(channelName, description, user);
  chan.owner = user;
  await connection.manager.save(chan);
}

export async function getPublicChannels(roomService: RoomService, amount = 50) {
  const connection = getConnection();

  const rawChannels = await connection.manager.find(Channel, {
    where: {
      isPublic: true
    },
    take: amount
  });

  const rooms = roomService.publicRooms.map(summarize);
  const channels = rawChannels.map(summarize);

  const res = mergeListsOn(channels, rooms, 'roomName');

  return res;
}

function summarize(i: any) {
  return {
    roomName: i.name,
    description: i.description || '...',
    memberCount: i.members ? i.members.length : 0,
    currentlyPlaying: i.currentPlayList ? i.currentPlayList.current : '...'
  };
}

function mergeListsOn(lsOne: any[], lsTwo: any[], hashKey: string) {
  const table = new Set(lsOne.map(d => d[hashKey]));
  const merged = [...lsOne, ...lsTwo.filter(d => !table.has(d[hashKey]))];

  return merged;
}
