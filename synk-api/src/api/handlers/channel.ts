import { getConnection } from 'typeorm';

import { Channel } from '../../domain/entity/Channel';
import { User } from '../../domain/entity/User';
import { RoomService } from '../../socket/services/room-service';
import { Room } from '../../socket/models/room';

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

  const channels = await connection.manager.find(Channel, {
    where: {
      isPublic: true
    },
    take: amount
  });

  const rooms = roomService.publicRooms;

  const res = mergeRoomAndChannel(channels, rooms);

  return res;
}

function mergeRoomAndChannel(channels: Channel[], rooms: Room[], key = 'name') {
  const roomsDict = rooms.map(room => {
    return {
      [room.name]: {
        name: room.name,
        memberCount: room.members.length,
        currentlyPlaying: room.currentPlayList.current
      }
    };
  });
  const channelsDict = channels.map(chan => {
    return {
      [chan.name]: {
        name: chan.name,
        description: chan.description
      }
    };
  });

  const all = channelsDict.map(chan => {
    return {
      ...roomsDict[(chan[0] as any).name],
      ...chan[0]
    };
  });


}
