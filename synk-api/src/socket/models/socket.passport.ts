import * as socketio from "socket.io";

interface PassportUser {
  username: string;
  id: string;
  logged_in: boolean;
}

export interface SocketPassport extends socketio.Socket {
  request: {
    user: PassportUser;
    session: any;
    isAuthenticated(): boolean;
  };
}
