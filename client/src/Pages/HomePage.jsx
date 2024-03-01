import { useCallback, useState, useEffect} from "react";
import { useSocket } from "../context/SocketProvider";
import {useNavigate} from "react-router-dom";
const LobbyPage = () => {
    const [email, setEmail] = useState("");
    const [roomId, setRoomId] = useState("");
    const socket = useSocket();
    const navigate = useNavigate();

    const handleJoinButtonClick = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', {email, roomId});
    },[email, roomId, socket]);

    const handleRoomJoin = useCallback(
        (data) => {
          const {roomId } = data;
          navigate(`/room/${roomId}`);
        },[navigate]);


    useEffect(()=>{
        socket.on('room:join', (data)=>{
            handleRoomJoin(data);
        
        return ()=>{
            socket.off('room:join', handleRoomJoin);
        }
    })},[socket, handleRoomJoin]);


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-sm mx-auto px-8 py-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Welcome</h1>
          <div className="mb-6">
            <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
            <input
              type="email"
              id="email-input"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="abc@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="room-id-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Room ID</label>
            <input
              id="room-id-input"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Room ID"
              onChange={(e) => setRoomId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={handleJoinButtonClick}
          >
            Join
          </button>
        </div>
      </div>

    )
  }
  
  export default LobbyPage