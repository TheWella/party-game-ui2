import React, { useState } from "react";
import io from "socket.io-client";

const socket = io("https://party-game-server.glitch.me");

export default function PartyGameApp() {
  const [page, setPage] = useState("landing"); // Landing, createRoom, joinRoom, lobby
  const [roomCode, setRoomCode] = useState("");
  const [nsfwMode, setNsfwMode] = useState(false);
  const [username, setUsername] = useState("");
  const [isHost, setIsHost] = useState(false);

  const goToCreateRoom = () => setPage("createRoom");
  const goToJoinRoom = () => setPage("joinRoom");

  const createRoom = () => {
    if (!username.trim()) {
      alert("Username is required to create a room.");
      return;
    }
    const newRoomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    setRoomCode(newRoomCode);
    setIsHost(true);
    socket.emit("createRoom", { roomCode: newRoomCode, nsfwMode, host: username });
    setPage("lobby");
  };

  const joinRoom = () => {
    if (!username.trim()) {
      alert("Username is required to join a room.");
      return;
    }
    if (!roomCode.trim()) {
      alert("Room code is required to join a room.");
      return;
    }
    socket.emit("joinRoom", { roomCode, username });
    setPage("lobby");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-200 text-black">
      {page === "landing" && (
        <div className="p-8 w-96 text-center bg-white shadow-md rounded-lg flex flex-col gap-6">
          <h1 className="text-3xl font-bold">Party Game</h1>
          <button className="bg-blue-500 text-white py-3 rounded-lg text-lg" onClick={goToCreateRoom}>Create Room</button>
          <button className="bg-green-500 text-white py-3 rounded-lg text-lg" onClick={goToJoinRoom}>Join Room</button>
        </div>
      )}

      {(page === "createRoom" || page === "joinRoom") && (
        <div className="p-6 w-96 text-center bg-white shadow-md rounded-lg flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{page === "createRoom" ? "Create Room" : "Join Room"}</h1>
          <input type="text" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 border rounded-lg w-full" />
          {page === "joinRoom" && (
            <input type="text" placeholder="Enter Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="p-3 border rounded-lg w-full" />
          )}
          {page === "createRoom" && (
            <div className="flex justify-center items-center gap-2">
              <label>NSFW Mode</label>
              <input type="checkbox" checked={nsfwMode} onChange={(e) => setNsfwMode(e.target.checked)} />
            </div>
          )}
          <button className="bg-blue-500 text-white p-3 rounded-lg w-full text-lg" onClick={page === "createRoom" ? createRoom : joinRoom}>{page === "createRoom" ? "Create Room" : "Join Room"}</button>
        </div>
      )}

      {page === "lobby" && <Lobby roomCode={roomCode} username={username} socket={socket} isHost={isHost} />}
    </div>
  );
}

function Lobby({ roomCode, username, socket, isHost }) {
  const [players, setPlayers] = useState([]);
  const [host, setHost] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const miniGames = ["Don't Say Umm", "Word Association", "Story Builder", "Charades"];

  socket.on("updateLobby", (roomData) => {
    setPlayers(roomData.players || []);
    setHost(roomData.host);
  });

  return (
    <div className="p-6 w-96 text-center bg-white shadow-md rounded-lg">
      <h1 className="text-xl font-bold">Room Code: {roomCode}</h1>
      <p className="text-sm">Host: {host}</p>
      <p className="text-sm">Players:</p>
      <ul className="text-lg">{players.map((player, index) => <li key={index}>{player}</li>)}</ul>
      {isHost && (
        <div className="mt-4">
          <label className="block mb-2">Select Mini-Game</label>
          <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} className="p-2 border rounded-lg w-full">
            <option value="">Random Mini-Game</option>
            {miniGames.map((game, index) => (
              <option key={index} value={game}>{game}</option>
            ))}
          </select>
        </div>
      )}
      {isHost && (
        <button className="mt-4 w-full bg-red-500 text-white p-3 rounded-lg text-lg">Start Game</button>
      )}
    </div>
  );
}
