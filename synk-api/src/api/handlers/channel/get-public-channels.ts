import { getConnection } from 'typeorm';

import { Channel } from '../../../domain/entity/Channel';
import { RoomService } from '../../../socket/services/room-service';

interface Summary {
  roomName: string;
  description: string;
  memberCount: number;
  currentlyPlaying: string;
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

  const res = mergeLists(channels, rooms);

  return res;
}

function summarize(i: any): Summary {
  return {
    roomName: i.name,
    description: i.description || '...',
    memberCount: i.members ? i.members.length : 0,
    currentlyPlaying: i.currentPlayList ? i.currentPlayList.current : '...'
  };
}

function mergeLists(allItems: Summary[], someItems: Summary[]) {
  const someItemsDict = toDictionary(someItems);
  return allItems.map(it => {
    const ls2i: Summary = someItemsDict[it.roomName];
    const summary: Summary = {
      currentlyPlaying: ls2i ? ls2i.currentlyPlaying : 'N/A',
      description: it.description,
      memberCount: ls2i ? ls2i.memberCount : 0,
      roomName: it.roomName,
    };
    return summary;
  })
}

function toDictionary(arr: Summary[]): any {
  const dict: any = {};
  return arr.forEach(it => {
    dict[it.roomName] = it;
  });
}
