import { getConnection } from 'typeorm';

import { User } from '../../../domain/entity/User';
import { Playlist } from '../../../domain/entity/Playlist';

export async function createPlaylist(username: string, playlistName: string) {
  const connection = getConnection();
  const user = await connection.manager.findOneOrFail(User, {
    where: {
      username
    }
  });

  const ls = Playlist.create(playlistName);
  user.playlists.push(ls);
  ls.createdBy = user;
  await connection.manager.save(user);
}
