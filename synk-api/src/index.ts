// tslint:disable:no-console

import configure from './startup';

async function RUN() {
  const { wsHttp } = await configure();

  // Go
  wsHttp.listen(3000, () => {
    console.info(`###########################`);
    console.info(`\t SERVER LAUNCHED`);
    console.info(`###########################`);
    console.info(`\t Started on port ${process.env.HOST_PORT}`);
    console.info(`###########################`);
  });
}

RUN()
  .catch(err => {
    console.error(`\t#########><::> ###############><::> ###`);
    console.error(`\t SERVER CRASHED`);
    console.error(`\t><::> ###################><::> ########`);
    console.error(err);
  })
  .finally(() => {
    // send telegram when kill? npm install telegraf
  });
