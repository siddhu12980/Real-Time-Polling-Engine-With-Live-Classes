
import { useEffect, useState } from 'react';
import { IoChatboxEllipses } from "react-icons/io5";
import { BsFillQuestionSquareFill } from "react-icons/bs";
import { FaPollH } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import Draw from './Draw';
import VideoChat from './VideoChat';
import PdfView from './PdfView';
import ShareTrackView from './ShareTrackView';
import AdaptiveVideo from './AdaptiveVideo';
import { PDFControls } from './PDFControls';
import { CustomBar } from './CustomBar';
import { LiveKitRoom, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface VideolayoutProps {
    token: string,
    userName: string,
    roomId: string
}

const serverUrl = 'wss://sidd-live-server-l3p4e136.livekit.cloud';


const Videolayout = () => {
    const token = sessionStorage.getItem('token');


    return <>
        < LiveKitRoom
            video={true}
            audio={true}
            token={token!}
            serverUrl={serverUrl}
            data-lk-theme="default"
        >

            <Videolayouts />
        </LiveKitRoom >

    </>


}

const Videolayouts = () => {
    const [activeSection, setActiveSection] = useState('Chat');
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const [changeScreen, setChangeScreen] = useState<boolean>(false);

    const [teacherContent, setTeacherContent] = useState<'Slide' | 'Screen' | 'Whiteboard' | 'Video' | 'None'>('None');



    const trackRef = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ]);

    const adminTrackRef = trackRef.find(
        (track) => track.participant?.identity === "admin" && track.source === "camera"
    );

    const shareTrackRef = trackRef.find(
        (track) => track.publication?.source === "screen_share"
    );



    useEffect(() => {


        const connect = async () => {
            try {
                const sockets = new WebSocket("ws://127.0.0.1:8080/ws");
                sockets.onopen = () => {
                    setSocket(sockets);

                    console.log("Socket Connected");
                    sockets.send(
                        JSON.stringify({
                            type: "sender",
                            roomId: "room1",
                            name: "sender1",
                            id: "s1"
                        })
                    );
                };



                sockets.onerror = (error) => {
                    console.error("Socket Error:", error);
                };

                sockets.onclose = () => {
                    console.log("Socket Closed");
                };
            } catch (e) {
                console.error("Error connecting WebSocket:", e);
            }
        };

        connect();

        if (shareTrackRef) {
            console.log("Screen share is happening");
            setTeacherContent("Screen");
        } 

        return () => {
            if (socket) {
                socket.close();
                console.log("Socket Closed on Cleanup");
            }
        };
    }, [shareTrackRef]);



    const renderActiveComponent = () => {
        switch (activeSection) {
            case 'Chat':
                return <VideoChat ws={socket} roomId='room1' userId='s1' username='sender1' />;
            case 'AskQuestions':
                return <div className="p-4 bg-gray-300 rounded">Ask Questions Component</div>;
            case 'Participants':
                return <div className="p-4 bg-gray-300 rounded">Participants Component</div>;
            case 'Pool':
                return <div className="p-4 bg-gray-300 rounded">Pool Component</div>;
            default:
                return null;
        }
    };

    // Render the dynamic teacher content
    const renderTeacherContent = () => {
        switch (teacherContent) {
            case 'Slide':
                return <div className="p-4  bg-blue-300 rounded h-[80vh] w-[60vw] ">   <PdfView /></div>;
            case 'Screen':
                return <div className="p-4 bg-green-300 rounded"><ShareTrackView shareTrackRef={shareTrackRef} /></div>;
            case 'Whiteboard':
                return <div className="p-4 bg-yellow-300 rounded h-[85vh] w-[60vw]" > <Draw role='teacher' roomId='room1' /> </div>;

            case "Video":
            // return <AdaptiveVideo    />
            default:
                return <div onClick={() => setTeacherContent("Slide")} className="p-4 bg-red-300 rounded">  Nothing to See Here</div>;
        }
    };

    return (
        <div className="p-4 h-screen flex">

            {/* Main Layout */}
            {changeScreen ? (
                <div className="flex w-full">
                    {/* Video/Shared Content Section */}
                    <div className="w-[70vw] bg-slate-400  flex flex-col justify-between">
                        {/* Top Section: Teacher Status */}

                        <div className="p-2 bg-slate-600 text-white text-center">
                            Teacher Status:
                            <span className="font-bold"> Class in Progress</span> |
                            <span className="font-bold"> 30 Participants</span>
                        </div>

                        {/* Middle Section: Shared Content */}
                        <div className="flex-grow flex items-center justify-center h-[100vh] w-full">
                            <AdaptiveVideo adminTrackRef={adminTrackRef} />
                        </div>

                        {/* Bottom Section: Control Bar */}
                        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                            <button className="px-4 py-2 bg-blue-500 rounded">Start Recording</button>
                            <button className="px-4 py-2 bg-red-500 rounded">End Class</button>
                        </div>
                    </div>


                    {/* Sidebar for Active Section */}
                    <div className="flex flex-col w-[35vw]">
                        <div className="h-[100vh] bg-slate-700">
                            {renderActiveComponent()}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex w-full">
                    {/* Teacher Sharing Section */}
                    <div className="w-[60vw] bg-slate-400 flex flex-col justify-between">
                        {/* Top Section: Teacher Status */}
                        <div className="p-2 bg-slate-600 text-white text-center">
                            Teacher Status:
                            <span className="font-bold"> Class in Progress</span> |
                            <span className="font-bold"> 30 Participants</span>
                        </div>

                        {/* Middle Section: Shared Content */}
                        <div className="flex-grow flex items-center justify-center ">
                            {renderTeacherContent()}
                        </div>
                        {teacherContent == "Slide" ? <div className=' flex  items-center justify-center '> <PDFControls className='z-10' isTeacher={true} /> </div> : <></>}

                        {/* Bottom Section: Control Bar */}

                        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">

                            <CustomBar



                                onBoardShare={() => {
                                    setTeacherContent("Whiteboard")
                                    if (!socket || socket.readyState != WebSocket.OPEN) {
                                        console.log("Sender Socket Not open ")
                                        return
                                    }
                                    socket.send(JSON.stringify({
                                        "type": teacherContent != "Whiteboard" ? "startBoard" : "endBoard",
                                        "roomId": "room1"
                                    }))

                                }}

                                onSlideShare={() => {

                                    setTeacherContent("Slide")

                                    if (!socket || socket.readyState != WebSocket.OPEN) {
                                        console.log("Sender Socket Not open ")
                                        return
                                    }

                                    socket.send(JSON.stringify({
                                        "type": teacherContent != "Slide" ? "startSlide" : "endSlide",
                                        "roomId": "room1"
                                    }))
                                }} />
                        </div>

                    </div>




                    {/* Admin and Active Section */}
                    <div className="flex flex-col w-[35vw]">
                        <div className="h-[30vh] w-[35VW] bg-slate-500 flex items-center justify-center">
                            <AdaptiveVideo adminTrackRef={adminTrackRef} />
                        </div>
                        <div className="h-[70vh] bg-slate-700">
                            {renderActiveComponent()}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar for Navigation */}
            <div className="w-[5vw] bg-gray-100  rounded">
                <ul className="space-y-2">
                    <li>
                        <button
                            className={`w-full text-left p-2 rounded ${activeSection === 'Chat' ? 'bg-gray-400' : ''}`}
                            onClick={() => setActiveSection('Chat')}
                        >
                            <IoChatboxEllipses size={24} />
                        </button>
                    </li>
                    <li>
                        <button
                            className={`w-full text-left p-2 rounded ${activeSection === 'AskQuestions' ? 'bg-gray-400' : ''}`}
                            onClick={() => setActiveSection('AskQuestions')}
                        >
                            <BsFillQuestionSquareFill size={24} />
                        </button>
                    </li>
                    <li>
                        <button
                            className={`w-full text-left p-2 rounded ${activeSection === 'Participants' ? 'bg-gray-400' : ''}`}
                            onClick={() => setActiveSection('Participants')}
                        >
                            <BsFillPeopleFill size={24} />
                        </button>
                    </li>
                    <li>
                        <button
                            className={`w-full text-left p-2 rounded ${activeSection === 'Pool' ? 'bg-gray-400' : ''}`}
                            onClick={() => setActiveSection('Pool')}
                        >
                            <FaPollH size={24} />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Videolayout;
