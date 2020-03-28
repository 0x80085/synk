import { getConnection } from 'typeorm';

import { User } from '../../../domain/entity/User';
import { Video } from '../../../domain/entity/Video';
import { MediaEvent } from '../../../socket/models/message';
import { RoomService } from '../../../socket/services/room-service';

export async function addVideoToPlaylist(username: string, url: string, playlistId: string, media: MediaEvent, roomService: RoomService) {
  const connection = getConnection();

  const user = await connection.manager.findOneOrFail(User, {
    where: {
      username
    }
  });

  const ls = user.playlists.filter(p => p.id === playlistId)[0];

  if (!ls) {
    return Error('Not found');
  }

  const vid: Video = Video.create(url);
  vid.addedBy = user;

  roomService.addMediaToPlaylist(media);

  ls.videos.push(vid);

  await connection.manager.save(ls);
}
