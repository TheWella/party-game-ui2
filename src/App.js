import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://party-game-server.glitch.me");

export default function PartyGameLobby() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [players, setPlayers] = useState([]);
  const [nsfwMode, setNsfwMode] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    socket.on("updateLobby", (roomData) => {
      setPlayers(Object.values(roomData.players));
      setNsfwMode(roomData.nsfw);
    });
    
    socket.on("gameStarted", () => {
      alert("Game is starting!");
    });
  }, []);

  const createRoom = () => {
    if (!username.trim()) {
      setErrorMessage("Username is required to create a room.");
      return;
    }
    setErrorMessage("");
    const newRoomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    setRoomCode(newRoomCode);
    socket.emit("createRoom", newRoomCode);
    setInRoom(true);
  };

  const joinRoom = () => {
    if (!username.trim()) {
      setErrorMessage("Username is required to join a room.");
      return;
    }
    if (!roomCode.trim()) {
      setErrorMessage("Room code is required to join a room.");
      return;
    }
    setErrorMessage("");
    socket.emit("joinRoom", { roomCode, username });
    setInRoom(true);
  };

  const toggleNSFW = () => {
    socket.emit("toggleNSFW", roomCode);
  };

  const startGame = () => {
    if (players.length < 2) {
      setErrorMessage("At least 2 players are required to start the game.");
      return;
    }
    setErrorMessage("");
    socket.emit("startGame", roomCode);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${nsfwMode ? "bg-gray-900 text-white" : "bg-blue-200"}`}>
      <div className="p-6 w-96 text-center bg-white shadow-md rounded-lg">
        {!inRoom ? (
          <div>
            <h1 className="text-2xl font-bold">Party Game Lobby</h1>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <input type="text" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 p-2 border rounded w-full" />
            <div className="flex flex-col gap-2 mt-4">
              <button className="bg-blue-500 text-white p-2 rounded" onClick={createRoom}>Create Room</button>
              <input type="text" placeholder="Enter Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="p-2 border rounded w-full" />
              <button className="bg-green-500 text-white p-2 rounded" onClick={joinRoom}>Join Room</button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold">Room Code: {roomCode}</h1>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <p className="text-sm">Players:</p>
            <ul className="text-lg">{players.map((player, index) => <li key={index}>{player}</li>)}</ul>
            <div className="flex justify-between mt-4">
              <label>NSFW Mode</label>
              <input type="checkbox" checked={nsfwMode} onChange={toggleNSFW} />
            </div>
            <button className="mt-4 w-full bg-red-500 text-white p-2 rounded" onClick={startGame}>Start Game</button>
          </div>
        )}
      </div>
    </div>
  );
}
