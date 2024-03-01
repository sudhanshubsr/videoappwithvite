const configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],
};
const peer = new RTCPeerConnection(configuration);
export default peer;

export async function getOffer(peer) {
  if (peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }
}

export async function getAnswer(peer, offer) {
  if (peer) {
    await peer.setRemoteDescription(offer);
    const ans = await peer.createAnswer();
    await peer.setLocalDescription(new RTCSessionDescription(ans));
    return ans;
  }
}


export async function setLocalDescription(peer, answer){
    if(peer){
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
}
