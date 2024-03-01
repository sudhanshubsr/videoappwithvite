import { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useSocket } from '../context/SocketProvider';
import peer, { getAnswer, getOffer, setLocalDescription } from '../service/peer.js';

const VideoAppPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState("");
    const [mystream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [showAcceptButton, setShowAcceptButton] = useState(false);
    const [showcallUser, setShowCallUser] = useState(false);

    const handleUserJoined = useCallback((data)=>{
        const {id} = data;
        setRemoteSocketId(id);
        setShowCallUser(true);
    },[]);

    const handleCallUser = useCallback(async()=>{
        setShowCallUser(false);
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        const offer = await getOffer(peer);
        socket.emit("user:call", {to: remoteSocketId, offer});
        setMyStream(stream)
    },[remoteSocketId, socket])

    const handleIncomingCall = useCallback(async ({from, offer})=>{     
        setRemoteSocketId(from);
        setShowAcceptButton(true);
    },[]);

    const handleAcceptCall = useCallback(async({from, offer})=>{
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        setMyStream(stream);
        const answer = await getAnswer(peer, offer);
        socket.emit("call:accepted", {to: from, answer});
        setShowAcceptButton(false);
    },[socket]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await getOffer(peer);
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
      }, [remoteSocketId, socket]);


    
      const handleEndCall = useCallback(() => {
        setMyStream(null);
        setRemoteStream(null);
        socket.emit("user:endcall", { to:remoteSocketId });
        setShowCallUser(true);
  }, [remoteSocketId, socket, peer]);


      useEffect(() => {
        socket.on("user:endcall", () => {
          setMyStream(null);
          setRemoteStream(null);
        });
        return () => {
            socket.off("user:endcall");
            }
        }, [socket]);





    const sendStreams = useCallback(async()=>{
        for (const track of mystream.getTracks()) {
            peer.addTrack(track, mystream);
          }
        await handleNegoNeeded();
        setShowAcceptButton(false);
    },[handleNegoNeeded, mystream])
    
    const handleAcceptedCall = useCallback(async ({answer, from})=>{
        await setLocalDescription(peer, answer);
        setShowAcceptButton(false);
    },[]);



      const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
          const ans = await getAnswer(peer, offer);
          socket.emit("peer:nego:done", { to: from, ans });
        },[socket]);
    
      const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await setLocalDescription(peer, ans);
      }, []);


      useEffect(() => {
        peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
          peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
      }, [handleNegoNeeded]);
    

    useEffect(()=>{
        peer.addEventListener("track", (event)=>{
            const remoteStream = event.streams;
            setRemoteStream(remoteStream[0]);
        })
    },[]);  

    useEffect(()=>{
        if(mystream){
            sendStreams();
        }
    },[mystream, sendStreams]);


    useEffect(()=>{
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleAcceptedCall);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);

        return ()=>{
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleAcceptedCall);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        }
    },[handleAcceptedCall, handleEndCall, handleIncomingCall, handleNegoNeedFinal, handleNegoNeedIncomming, handleUserJoined, socket]);

    


  return (

<>
<div className="flex flex-col items-center gap-4 mt-4">
  {/* Connection status */}
  <div className="flex items-center rounded-full bg-gray-200 px-4 py-2">
    {remoteSocketId ? (
      <>
        <div className="bg-green-500 h-3 w-3 rounded-full mr-2"></div>
        <h1 className="text-lg text-gray-700">Connected</h1>
      </>
    ) : (
      <h1 className="text-lg text-gray-700">No one in the room</h1>
    )}
  </div>

  {/* Call user button */}
  {showcallUser && (
    <div className="flex items-center gap-2">
      <p className="text-lg text-gray-700">{remoteSocketId}</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleCallUser}
      >
        Call User
      </button>
    </div>
  )}
</div>

  {/* Call buttons */}
  <div className="flex justify-center mt-4">
    {remoteStream && (
      <>
        {showAcceptButton && (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={handleAcceptCall}
          >
            Accept Call
          </button>
        )}
        {!showAcceptButton && (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleEndCall}
          >
            End Call
          </button>
        )}
      </>
    )}
  </div>

  {/* Video streams */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
    {mystream && (
      <div className="rounded-lg overflow-hidden relative">
        <h1 className="text-xl mb-2 text-center text-black font-bold">My Stream</h1>
        <div className="w-full h-60">
          <ReactPlayer url={mystream} playing={true} muted width="100%" height="100%" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-50"></div>
        </div>
      </div>
    )}

    {remoteStream && (
      <div className="rounded-lg overflow-hidden relative">
        <h1 className="text-xl mb-2 text-center text-black font-bold">Remote Stream</h1>
        <div className="w-full h-60">
          <ReactPlayer url={remoteStream} playing={true} muted width="100%" height="100%" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-50"></div>
        </div>
      </div>
    )}
  </div>
</>
    
  )
}

export default VideoAppPage