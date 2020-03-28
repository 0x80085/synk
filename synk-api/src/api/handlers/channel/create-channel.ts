import { getConnection } from 'typeorm';

import { Channel } from '../../../domain/entity/Channel';
import { User } from '../../../domain/entity/User';

export async function createChannel(username: string, channelName: string, description: string) {
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


