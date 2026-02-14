import './App.css'
import ValentineEnvelope from "./components/ValentineEnvelope";
import HeartsBackground from "./components/HeartsBackground";

function App() {
  return (
    <div className="relative min-h-screen">
      <HeartsBackground count={22} />

      {/* Your content goes above */}
      <div className="relative z-10">
        {/* <ValentineEnvelope /> */}
        <div className="min-h-screen grid place-items-center">
          <ValentineEnvelope />
        </div>
      </div>
    </div>
  )
}

export default App
