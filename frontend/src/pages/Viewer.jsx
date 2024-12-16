import Hls from "hls.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";

import { authToken, createMeeting } from "../API";
import ReactPlayer from "react-player";
import { useAuthStore } from "../store/authStore";
import Countdown from '../utils/Countdown';

function JoinScreen({ getMeetingAndToken, setMode, meetingId }) {
  const [meetingIdState, setMeetingIdState] = useState(meetingId || "");

  const onClick = async (mode) => {
    setMode(mode);
    await getMeetingAndToken(meetingIdState);
  };
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
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ gap: '16px', margin: '16px 0' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem' }}>
          {/* Showing message if HLS is not started or is stopped by HOST */}
          {hlsState != "HLS_PLAYABLE" ? (
            <div>
              <p>Client is not browsing the page or decline camera access.</p>
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
                    return (
                      <div>
                        <p>Error playing video. Please try again later.</p>
                      </div>
                    );
                  }}
                ></video>
              </div>
            )
          )}
        </div>
        <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#FEE2E2', borderLeft: '4px solid #EA5858', color: '#B91C1C' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Important Warning</h2>
          <p style={{ fontSize: '14px' }}>
            The use of this application for unauthorized surveillance or monitoring is strictly prohibited. It is illegal, unethical, and a severe violation of privacy. Always respect others' boundaries and obtain proper consent for any monitoring activities. Misuse of this tool may result in legal consequences.
          </p>
        </div>
      </div>
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

  useEffect(() => {
    const timeoutId = setTimeout(joinMeeting, 5000); // Delay of 5 seconds (5000 milliseconds)

    return () => clearTimeout(timeoutId); // Cleanup function to prevent memory leaks
  }, []);
  
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', backgroundColor: 'lightblue', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}>
      {joined && joined == "JOINED" ? (
        mMeeting.localParticipant.mode == Constants.modes.CONFERENCE ? (
          <SpeakerView />
        ) : mMeeting.localParticipant.mode == Constants.modes.VIEWER ? (
          <ViewerView />
        ) : null
      ) : joined && joined == "JOINING" ? (
        <p>Loading...</p>
      ) : (
        <p>Checking Client...</p>
      )}
    </div>
  );
}

const Viewer = () => {
  const { user } = useAuthStore();
  const [initialTime] = Countdown(user.time);
  const { meetingId } = useParams();
  const [meetingIdState, setMeetingId] = useState(meetingId || null);
  const [mode, setMode] = useState("VIEWER"); // Default to VIEWER

  const getMeetingAndToken = async (id) => {
    const meetingId = id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => { // Use setTimeout for the delay
      getMeetingAndToken(meetingIdState); // Join as viewer after 5 seconds
    }, 3000); // 5000 milliseconds = 5 seconds

    return () => clearTimeout(timeoutId);  // Clear the timeout on unmount
  }, [meetingIdState]);

  return authToken && meetingIdState ? (
    <MeetingProvider
      config={{
        meetingId: meetingIdState,
        micEnabled: true,
        webcamEnabled: true,
        name: "C.V. Zai",
        mode: mode, // Use the default mode "VIEWER"
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => (
          <Container meetingId={meetingIdState} onMeetingLeave={onMeetingLeave} />
        )}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} setMode={setMode} meetingId={meetingIdState} />
  );
};

export default Viewer;