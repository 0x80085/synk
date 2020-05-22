import { getConnection } from 'typeorm';

import { Channel } from '../../../domain/entity/Channel';
import { User } from '../../../domain/entity/User';

export async function deleteChannel(username: string, channelName: string) {
  const connection = getConnection();

  const user = await connection.manager.findOneOrFail(User, {
    relations: ['Channel'],
    where: {
      username
    }
  });

  console.log(user.channels);

  const chan = user.channels.find(ch => channelName === ch.name);

  if (chan) {
    await connection.manager.delete(Channel, { name: chan.name });
  }

}


