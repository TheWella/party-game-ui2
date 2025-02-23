import React, { useState } from "react";
import io from "socket.io-client";

const socket = io("https://party-game-server.glitch.me");

export default function PartyGameApp() {
  const [page, setPage] = useState("landing"); // Landing, createRoom, joinRoom, lobby
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [nsfwMode, setNsfwMode] = useState(false);

  const goToCreateRoom = () => setPage("createRoom");
  const goToJoinRoom = () => setPage("joinRoom");

  const createRoom = () => {
    const newRoomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    setRoomCode(newRoomCode);
    socket.emit("createRoom", { roomCode: newRoomCode, nsfwMode });
    setPage("lobby");
  };

  const joinRoom = () => {
    if (!roomCode.trim()) {
      alert("Room code is required to join a room.");
      return;
    }
    setPage("lobby");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-200 text-black">
      {page === "landing" && (
        <div className="p-6 w-96 text-center bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold">Party Game</h1>
          <button className="bg-blue-500 text-white p-2 rounded mt-4 w-full" onClick={goToCreateRoom}>Create Room</button>
          <button className="bg-green-500 text-white p-2 rounded mt-2 w-full" onClick={goToJoinRoom}>Join Room</button>
        </div>
      )}

      {page === "createRoom" && (
        <div className="p-6 w-96 text-center bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold">Create Room</h1>
          <label className="block mt-4">NSFW Mode</label>
          <input type="checkbox" checked={nsfwMode} onChange={(e) => setNsfwMode(e.target.checked)} />
          <button className="bg-blue-500 text-white p-2 rounded mt-4 w-full" onClick={createRoom}>Create Room</button>
        </div>
      )}

      {page === "joinRoom" && (
        <div className="p-6 w-96 text-center bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold">Join Room</h1>
          <input type="text" placeholder="Enter Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="p-2 border rounded w-full mt-4" />
          <button className="bg-green-500 text-white p-2 rounded mt-4 w-full" onClick={joinRoom}>Join Room</button>
        </div>
      )}

      {page === "lobby" && <Lobby roomCode={roomCode} username={username} socket={socket} />}
    </div>
  );
}

function Lobby({ roomCode, username, socket }) {
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
      <div className="mt-4">
        <label className="block mb-2">Select Mini-Game</label>
        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} className="p-2 border rounded w-full">
          <option value="">Random Mini-Game</option>
          {miniGames.map((game, index) => (
            <option key={index} value={game}>{game}</option>
          ))}
        </select>
      </div>
      <button className="mt-4 w-full bg-red-500 text-white p-2 rounded">Start Game</button>
    </div>
  );
}
