import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

class GameService {
  constructor() {
    this.connection = null;
    this.eventHandlers = {};
    this.roomId = null;
    this.rooms={};
  }

  async connectSignalR() {
    // If already connected, skip setup
    if (this.connection) {
      if (this.connection.state === HubConnectionState.Connected) {
        return;
      }
    }else{
      // Build new connection
      this.connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5054/gamehub")
        .withAutomaticReconnect()
        .build();
      // Attempt to start the connection
      await this.connection.start();
    }

    // If reconnecting, wait until reconnection completes
    if (this.connection) {
      if (this.connection.state === HubConnectionState.Reconnecting) {
        while (this.connection.state === HubConnectionState.Reconnecting) {
          await new Promise((res) => setTimeout(res, 100));
        }

        // If reconnected successfully, continue
        if (this.connection.state === HubConnectionState.Connected) return;
      }
    }
    
    // Setup lifecycle handlers
    this.connection.onclose((error) => {
      console.log("SignalR connection closed.", error);
      this.eventHandlers["ConnectionClosed"]?.(error);
    });

    this.connection.onreconnecting((error) => {
      console.log("SignalR reconnecting...", error);
      this.eventHandlers["ConnectionReconnecting"]?.(error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("SignalR reconnected!", connectionId);
      this.eventHandlers["ConnectionReconnected"]?.(connectionId);
    });

    // Wire up game-specific events
    this.connection.on("RoomCreated", (newRoomId,firstPlayer) => {
      console.log(newRoomId,firstPlayer);
      this.eventHandlers["RoomCreated"]?.(newRoomId,firstPlayer);
      this.roomId = newRoomId;
      this.rooms[newRoomId]={firstPlayer:firstPlayer,secondPlayer:null};
    });

    this.connection.on("StartGame", (newRoomId,firstPlayer,secondPlayer) => {
      this.eventHandlers["StartGame"]?.(newRoomId,firstPlayer,secondPlayer);
      this.rooms[newRoomId]={firstPlayer:firstPlayer,secondPlayer:secondPlayer};
      this.roomId = newRoomId;
    });

    this.connection.on("PlayerJoined", () => {
      this.eventHandlers["PlayerJoined"]?.();
    });

    this.connection.on("ReceiveMove", (data) => {
      this.eventHandlers["ReceiveMove"]?.(data);
    });

    this.connection.on("GameOver", (winner) => {
      this.eventHandlers["GameOver"]?.(winner);
    });

    this.connection.on("Error", (msg) => {
      this.eventHandlers["Error"]?.(msg);
      //console.error(msg);
    });
    this.connection.on("Alert", (type,msg) => {
      this.eventHandlers["Alert"]?.(type,msg);
      //console.error(msg);
    });
    

    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error("SignalR failed to connect.");
    }
  }


  async createRoom(username) {
    await this.connectSignalR();

    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("SignalR is not connected.");
    }

    this.roomId = await this.connection.invoke("CreateRoom",username);
    return this.roomId;
  }

  async joinRoom(roomId,username) {
    await this.connectSignalR();

    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("SignalR is not connected.");
    }

    var _=await this.connection.invoke("JoinRoom", roomId,username);
    console.log(this.rooms);
  }

  async move(player, row, col) {
    if (!this.roomId) throw new Error("Join or create a room first.");

    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Cannot send move: SignalR is not connected.");
    }

    await this.connection.invoke("MakeMove", this.roomId, row, col,player);
  }

  on(eventName, callback) {
    this.eventHandlers[eventName] = callback;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  getPlayers(roomId){
    return this.rooms[roomId];
  }
}

export const gameService = new GameService();
