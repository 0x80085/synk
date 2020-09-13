import { getConnection } from 'typeorm';

import { Channel } from '../../../domain/entity/Channel';
import { RoomService } from '../../../socket/services/room-service';
import { Room } from '../../../socket/models/room';

interface ChannelSummary {
  roomName: string;
  description: string;
  memberCount?: number;
  currentlyPlaying?: string;
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

  const firstTwentyChannelsSortedByActiveUserCount = res
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 20);

  return firstTwentyChannelsSortedByActiveUserCount;
}

function mergeLists(allItems: ChannelSummary[], someItems: ChannelSummary[] = []) {
  const someItemsDict = toChannelDictionary(someItems);
  return allItems.map(it => {
    const secondListEntry: ChannelSummary = someItemsDict[it.roomName];
    const summary: ChannelSummary = {
      currentlyPlaying: secondListEntry ? secondListEntry.currentlyPlaying : 'N/A',
      description: it.description,
      memberCount: secondListEntry ? secondListEntry.memberCount : 0,
      roomName: it.roomName,
    };
    return summary;
  });
}

function summarize(it: Room | Channel): ChannelSummary {
  function hasMembers(ting: Room | Channel): ting is Room {
    return (ting as Room).members !== undefined;
  }
  return hasMembers(it)
    ? {
      roomName: it.name,
      description: it.description,
      memberCount: it.members.length,
      currentlyPlaying: getCurrentlyPlaying(it)
    }
    :
    {
      roomName: it.name,
      description: it.description
    };
}


function toChannelDictionary(channels: ChannelSummary[]) {
  const channelMap: any = {};
  channels.forEach(it => {
    channelMap[it.roomName] = it;
  });
  return channelMap;
}

function getCurrentlyPlaying(room: Room) {
  return room && room.currentPlayList && room.currentPlayList.current
    ? room.currentPlayList.current.title
    : 'N/A';
}
