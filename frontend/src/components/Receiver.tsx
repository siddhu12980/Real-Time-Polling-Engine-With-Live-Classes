import React, { useState, useEffect, useRef } from 'react';

interface ConnectionState {
  webSocket: boolean;
  peerConnection: boolean;
  receiving: boolean;
}

export const Receiver: React.FC = () => {

  const videoRef = useRef<HTMLVideoElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    webSocket: false,
    peerConnection: false,
    receiving: false,
  });

  useEffect(() => {

    const socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({ type: 'receiver' }));
      setConnectionState(prev => ({ ...prev, webSocket: true }));
    };

    const pc = new RTCPeerConnection();




    pc.ontrack = (event) => {
      console.log('Received track:', event.track.kind);

      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([event.track]);
        setConnectionState(prev => ({ ...prev, receiving: true }));

      }
    };


    pc.onicecandidate = (event) => {
      console.log("Sending ice")
      if (event.candidate && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'ice',
          candidate: event.candidate
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionState(prev => ({
        ...prev,
        peerConnection: pc.connectionState === 'connected'
      }));
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionState(prev => ({ ...prev, webSocket: false }));
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState(prev => ({ ...prev, webSocket: false }));
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("message recived in receiver ", message)

        switch (message.type) {
          case 'offer':
            await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log("Sending ANswer")
            socket.send(JSON.stringify({
              type: 'answer',
              sdp: answer
            }));
            break;

          case 'ice':
            console.log("Received Candidate")
            if (message.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
            break;

          case 'error':
            console.error('Server error:', message.message);
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
      pc.close();
      socket.close();
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebRTC Receiver</h2>

      <div className="space-y-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-2xl bg-black"
        />

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connectionState.webSocket ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span>WebSocket: {connectionState.webSocket ? 'Connected' : 'Disconnected'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connectionState.peerConnection ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span>Peer Connection: {connectionState.peerConnection ? 'Connected' : 'Disconnected'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connectionState.receiving ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span>Stream: {connectionState.receiving ? 'Receiving' : 'Not Receiving'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
