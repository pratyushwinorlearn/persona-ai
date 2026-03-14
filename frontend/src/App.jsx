import { useState } from "react";
import StartInterview from "./pages/StartInterview";
import InterviewRoom from "./pages/InterviewRoom";
import Summary from "./pages/Summary";

export default function App() {
  const [stage, setStage] = useState("start");
  const [interviewData, setInterviewData] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  return (
    <>
      {stage === "start" && (
        <StartInterview
          onStart={(data) => {
            setInterviewData(data);
            setInterviewId(data.interviewId);
            setStage("interview");
          }}
        />
      )}

      {stage === "interview" && interviewData && (
        <InterviewRoom
          interviewData={interviewData}
          onFinish={(id) => {
            setInterviewId(id);
            setStage("summary");
          }}
        />
      )}

      {stage === "summary" && interviewId && (
        <Summary
          interviewId={interviewId}
          onRestart={() => {
            setInterviewData(null);
            setInterviewId(null);
            setStage("start");
          }}
        />
      )}
    </>
  );
}