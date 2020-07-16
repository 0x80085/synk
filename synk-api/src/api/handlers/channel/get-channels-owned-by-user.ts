import { getConnection } from 'typeorm';

import { User } from '../../../domain/entity/User';

export async function getChannelsOwnedByUser(username: string) {
  const connection = getConnection();

  const user = await connection.manager.findOneOrFail(User, {
    relations: ['channels'],
    where: {
      username
    }
  });

  return user.channels;
}


