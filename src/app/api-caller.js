const API_BASE = 'http://localhost:5054/api/game';

async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials:"include"
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Error ${response.status}: ${errData.message || 'Unknown error'}`);
  }
  var room=await response.json();
  console.log(room);
  return room.roomId;
}

export async function createRoom()
{
  return await apiRequest("/create-room","POST");
}

export async function joinRoom(roomId)
{
  return await apiRequest("/join-room","POST",{"roomId":roomId});
}

export async function move(player,roomId,row,col)
{
  return await apiRequest("/move","POST",{"Player":player,"RoomId":roomId,"Row":row,"Col":col});
}

