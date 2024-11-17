import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ConnectionState {
  webSocket: boolean;
  peerConnection: boolean;
  streaming: boolean;
}

export const Sender: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    webSocket: false,
    peerConnection: false,
    streaming: false,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const socketInstance = new WebSocket('ws://localhost:8080/ws');

    socketInstance.onopen = () => {
      console.log('WebSocket connected');
      socketInstance.send(JSON.stringify({ type: 'sender' }));
      setConnectionState(prev => ({ ...prev, webSocket: true }));
    };

    socketInstance.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionState(prev => ({ ...prev, webSocket: false }));
    };

    socketInstance.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState(prev => ({ ...prev, webSocket: false }));
    };

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current!.srcObject = stream;
        setStream(stream)
        setConnectionState(prev => ({
          ...prev,
          streaming: true
        }));

        stream.getTracks().forEach((track) => {
          pc?.addTrack(track);
        });
      })
      .catch(error => {
        console.error('Failed to access media devices:', error);
      });

  }


  const handleWebRTCError = useCallback((error: any, context: string) => {
    console.error(`WebRTC Error (${context}):`, error);
    setConnectionState(prev => ({ ...prev, peerConnection: false }));
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
  }, [peerConnection]);


  const initiateConnection = async () => {
    try {
      setConnectionState(prev => ({ ...prev, streaming: false }));

      if (!socket) {
        throw new Error('WebSocket not connected');
      }

      socket!.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log("Message reveived in sendear: ", message)

        try {
          switch (message.type) {
            case 'answer':
              await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
              setConnectionState(prev => ({ ...prev, streaming: true }));
              break;

            case 'ice':
              if (message.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
              }
              break;

            case 'error':
              throw new Error(message.message || 'Unknown error from server');
          }
        } catch (error) {
          handleWebRTCError(error, `Processing ${message.type}`);
        }
      };


      const pc = new RTCPeerConnection();


      setPeerConnection(pc);

      pc.onicecandidate = (event) => {
        console.log("Sending Ice candidate")
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
      ;

      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.send(JSON.stringify({
          type: 'offer',
          sdp: pc.localDescription
        }));
      }

      getCameraStreamAndSend(pc)

    } catch (error) {
      handleWebRTCError(error, 'Connection initiation');
    }
  };

  const disconnectStream = useCallback(() => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setConnectionState(prev => ({
      ...prev,
      peerConnection: false,
      streaming: false
    }));
  }, [peerConnection, stream]);

  return (
    <div className="p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-2xl bg-black"
      />


      <h2 className="text-xl font-bold mb-4">WebRTC Sender</h2>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={initiateConnection}
            disabled={!connectionState.webSocket || connectionState.streaming}
            className={`px-4 py-2 rounded ${!connectionState.webSocket || connectionState.streaming
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            {connectionState.streaming ? 'Streaming...' : 'Start Streaming'}
          </button>

          <button
            onClick={disconnectStream}
            disabled={!connectionState.streaming}
            className={`px-4 py-2 rounded ${!connectionState.streaming
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
          >
            Stop Streaming
          </button>
        </div>

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
            <div className={`w-3 h-3 rounded-full ${connectionState.streaming ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span>Streaming: {connectionState.streaming ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
