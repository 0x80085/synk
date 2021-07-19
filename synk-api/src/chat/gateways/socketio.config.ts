import { GatewayMetadata } from '@nestjs/websockets';

export const SOCKET_IO_CONFIG: GatewayMetadata = {
  /*
   * Set ping timeout to 2 minutes to avoid spurious reconnects
   * during transient network issues.  The default of 5 minutes
   * is too aggressive.
   *
   * https://github.com/calzoneman/sync/issues/780
   */
  pingTimeout: 120000,
  pingInterval: 5000,

  /*
   * Per `ws` docs: "Note that Node.js has a variety of issues with
   * high-performance compression, where increased concurrency,
   * especially on Linux, can lead to catastrophic memory
   * fragmentation and slow performance."
   *
   * CyTube's frames are ordinarily quite small, so there's not much
   * point in compressing them.
   */
  perMessageDeflate: false,
  httpCompression: false,

  /*
   * Default is 10MB.
   * Even 1MiB seems like a generous limit...
   */
  // tslint:disable-next-line: no-bitwise
  maxHttpBufferSize: 1 << 20
};
