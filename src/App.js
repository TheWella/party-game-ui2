import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://your-project-name.glitch.me");

export default function PartyGameLobby() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [players, setPlayers] = useState([]);
  const [nsfwMode, setNsfwMode] = useState(false);
  const [inRoom, setInRoom] = useState(false);

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
    const newRoomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    setRoomCode(newRoomCode);
    socket.emit("createRoom", newRoomCode);
    setInRoom(true);
  };

  const joinRoom = () => {
    if (roomCode && username) {
      socket.emit("joinRoom", { roomCode, username });
      setInRoom(true);
    }
  };

  const toggleNSFW = () => {
    socket.emit("toggleNSFW", roomCode);
  };

  const startGame = () => {
    socket.emit("startGame", roomCode);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${nsfwMode ? "bg-gray-900 text-white" : "bg-blue-200"}`}>
      <h1 className="text-2xl font-bold">Party Game Lobby</h1>
      {!inRoom ? (
        <>
          <input placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={createRoom}>Create Room</button>
          <input placeholder="Enter Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
          <button onClick={joinRoom}>Join Room</button>
        </>
      ) : (
        <>
          <h2>Room Code: {roomCode}</h2>
          <p>Players: {players.join(", ")}</p>
          <button onClick={toggleNSFW}>Toggle NSFW</button>
          <button onClick={startGame}>Start Game</button>
        </>
      )}
    </div>
  );
}
