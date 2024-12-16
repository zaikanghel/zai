import Hls from "hls.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";
import { useAuthStore } from "../store/authStore";
import Countdown from '../utils/Countdown';

import { authToken, createMeeting } from "../API";
import ReactPlayer from "react-player";

function JoinScreen({ getMeetingAndToken, setMode }) {
  const [meetingId, setMeetingId] = useState(null);
  //Set the mode of joining participant and set the meeting id or generate new one
  const onClick = async (mode) => {
    setMode(mode);
    await getMeetingAndToken(meetingId);
  };
  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', backgroundColor: 'lightblue', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ gap: '16px', margin: '16px 0' }}>
          {/* Main illustration */}
          <div style={{ aspectRatio: '1/1', maxWidth: '280px', width: '100%', margin: '0 auto', position: 'relative' }}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZQVAGRxLD-5Ryo1QWgpA9jbOpEJokuGcfbPfMSrR70GYd-Gn3dnp4keIe&s=10" alt="View Image" style={{ objectFit: 'contain', width: '100%', height: 'auto' }} loading="lazy" />
          </div>

          {/* Content Card */}
          <div style={{ backgroundColor: '#00BFB3', color: 'white', border: 'none', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <div style={{ padding: '16px', gap: '8px', textAlign: 'center' }}> {/* Added textAlign: 'center' */}
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                Get View
              </h1>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                Effortless method to oversee client activities through a secure webpage interface.
              </p>
              <button onClick={() => onClick("CONFERENCE")} style={{
                backgroundColor: '#fff', 
                color: '#00BFB3', 
                padding: '12px 24px', 
                borderRadius: '30px', 
                border: 'none', 
                cursor: 'pointer', 
                transition: 'background-color 0.3s ease',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                display: 'block',  /* Added display: 'block' */
                margin: '0 auto'   /* Added margin: '0 auto' */
              }}>
                Generate Code
              </button>
            </div>
          </div>

          <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#FEE2E2', borderLeft: '4px solid #EA5858', color: '#B91C1C' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Important Warning</h2>
            <p style={{ fontSize: '14px' }}>
              The use of this application for unauthorized surveillance or monitoring is strictly prohibited. It is illegal, unethical, and a severe violation of privacy. Always respect others' boundaries and obtain proper consent for any monitoring activities. Misuse of this tool may result in legal consequences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  //Playing the audio in the <audio>
  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div>
      <p>
        Participant: {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
        {micOn ? "ON" : "OFF"}
      </p>
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn && (
        <ReactPlayer
          //
          playsinline // extremely crucial prop
          pip={false}
          light={false}
          controls={false}
          muted={false}
          playing={true}
          //
          url={videoStream}
          //
          height={"300px"}
          width={"300px"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      )}
    </div>
  );
}

function Controls() {
  const { leave, toggleMic, toggleWebcam, startHls, stopHls } = useMeeting();
  return (
    <div>
      <button onClick={() => leave()}>Leave</button>
      &emsp;|&emsp;
      <button onClick={() => toggleMic()}>toggleMic</button>
      <button onClick={() => toggleWebcam()}>toggleWebcam</button>
      &emsp;|&emsp;
      <button
        onClick={() => {
          //Start the HLS in SPOTLIGHT mode and PIN as
          //priority so only speakers are visible in the HLS stream
          startHls({
            layout: {
              type: "SPOTLIGHT",
              priority: "PIN",
              gridSize: "20",
            },
            theme: "LIGHT",
            mode: "video-and-audio",
            quality: "high",
            orientation: "landscape",
          });
        }}
      >
        Start HLS
      </button>
      <button onClick={() => stopHls()}>Stop HLS</button>
    </div>
  );
}

function SpeakerView() {
  //Get the participants and HLS State from useMeeting
  const { participants, hlsState } = useMeeting();

  //Filtering the host/speakers from all the participants
  const speakers = useMemo(() => {
    const speakerParticipants = [...participants.values()].filter(
      (participant) => {
        return participant.mode == Constants.modes.CONFERENCE;
      }
    );
    return speakerParticipants;
  }, [participants]);
  return (
    <div>
      <p>Current HLS State: {hlsState}</p>
      {/* Controls for the meeting */}
      <Controls />

      {/* Rendring all the HOST participants */}
      {speakers.map((participant) => (
        <ParticipantView participantId={participant.id} key={participant.id} />
      ))}
    </div>
  );
}

function ViewerView() {
  // States to store downstream url and current HLS state
  const playerRef = useRef(null);
  //Getting the hlsUrls
  const { hlsUrls, hlsState } = useMeeting();

  //Playing the HLS stream when the playbackHlsUrl is present and it is playable
  useEffect(() => {
    if (hlsUrls.playbackHlsUrl && hlsState == "HLS_PLAYABLE") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxLoadingDelay: 1, // max video loading delay used in automatic start level selection
          defaultAudioCodec: "mp4a.40.2", // default audio codec
          maxBufferLength: 0, // If buffer length is/becomes less than this value, a new fragment will be loaded
          maxMaxBufferLength: 1, // Hls.js will never exceed this value
          startLevel: 0, // Start playback at the lowest quality level
          startPosition: -1, // set -1 playback will start from intialtime = 0
          maxBufferHole: 0.001, // 'Maximum' inter-fragment buffer hole tolerance that hls.js can cope with when searching for the next fragment to load.
          highBufferWatchdogPeriod: 0, // if media element is expected to play and if currentTime has not moved for more than highBufferWatchdogPeriod and if there are more than maxBufferHole seconds buffered upfront, hls.js will jump buffer gaps, or try to nudge playhead to recover playback.
          nudgeOffset: 0.05, // In case playback continues to stall after first playhead nudging, currentTime will be nudged evenmore following nudgeOffset to try to restore playback. media.currentTime += (nb nudge retry -1)*nudgeOffset
          nudgeMaxRetry: 1, // Max nb of nudge retries before hls.js raise a fatal BUFFER_STALLED_ERROR
          maxFragLookUpTolerance: .1, // This tolerance factor is used during fragment lookup.
          liveSyncDurationCount: 1, // if set to 3, playback will start from fragment N-3, N being the last fragment of the live playlist
          abrEwmaFastLive: 1, // Fast bitrate Exponential moving average half-life, used to compute average bitrate for Live streams.
          abrEwmaSlowLive: 3, // Slow bitrate Exponential moving average half-life, used to compute average bitrate for Live streams.
          abrEwmaFastVoD: 1, // Fast bitrate Exponential moving average half-life, used to compute average bitrate for VoD streams
          abrEwmaSlowVoD: 3, // Slow bitrate Exponential moving average half-life, used to compute average bitrate for VoD streams
          maxStarvationDelay: 1, // ABR algorithm will always try to choose a quality level that should avoid rebuffering
        });

        let player = document.querySelector("#hlsPlayer");

        hls.loadSource(hlsUrls.playbackHlsUrl);
        hls.attachMedia(player);
      } else {
        if (typeof playerRef.current?.play === "function") {
          playerRef.current.src = hlsUrls.playbackHlsUrl;
          playerRef.current.play();
        }
      }
    }
  }, [hlsUrls, hlsState, playerRef.current]);

  return (
    <div>
      {/* Showing message if HLS is not started or is stopped by HOST */}
      {hlsState != "HLS_PLAYABLE" ? (
        <div>
          <p>HLS has not started yet or is stopped</p>
        </div>
      ) : (
        hlsState == "HLS_PLAYABLE" && (
          <div>
            <video
              ref={playerRef}
              id="hlsPlayer"
              autoPlay={true}
              controls
              style={{ width: "100%", height: "100%" }}
              playsinline
              playsInline
              muted={true}
              playing
              onError={(err) => {
                console.log(err, "hls video error");
              }}
            ></video>
          </div>
        )
      )}
    </div>
  );
}

function Container(props) {
  const [joined, setJoined] = useState(null);
  //Get the method which will be used to join the meeting.
  const { join } = useMeeting();
  const mMeeting = useMeeting({
    //callback for when a meeting is joined successfully
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    //callback for when a meeting is left
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
    //callback for when there is an error in a meeting
    onError: (error) => {
      alert(error.message);
    },
  });
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', backgroundColor: 'lightblue', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ gap: '16px', margin: '16px 0' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Code Information</h2>
              <p><strong>Code:</strong> {props.meetingId}</p>
              <p><strong>Client View:</strong> <a href="/" style={{ color: '#007bff', textDecoration: 'underline' }}>http://localhost:5000/zflix/{props.meetingId}</a></p>
              <p><strong>Agent View:</strong> <a href="/" style={{ color: '#007bff', textDecoration: 'underline' }}>http://localhost:5000/viewer/{props.meetingId}</a></p>
            </div>
          </div>
          <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#FEE2E2', borderLeft: '4px solid #EA5858', color: '#B91C1C' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Important Warning</h2>
            <p style={{ fontSize: '14px' }}>
              The use of this application for unauthorized surveillance or monitoring is strictly prohibited. It is illegal, unethical, and a severe violation of privacy. Always respect others' boundaries and obtain proper consent for any monitoring activities. Misuse of this tool may result in legal consequences.
            </p>
          </div>
          </div>
        </div>
    </div>
  );
}

const GetView = () => {
  const { user } = useAuthStore();
  const [meetingId, setMeetingId] = useState(null);

  const [initialTime] = Countdown(user.time);
  
  //State to handle the mode of the participant i.e. CONFERENCE or VIEWER
  const [mode, setMode] = useState("CONFERENCE");

  //You have to get the MeetingId from the API created earlier
  const getMeetingAndToken = async (id) => {
    const meetingId =
      id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "C.V. Raman",
        //This will be the mode of the participant CONFERENCE or VIEWER
        mode: mode,
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => (
          <Container meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
        )}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} setMode={setMode} />
  );
}

export default GetView;