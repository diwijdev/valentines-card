import HeartsBackground from "./components/HeartsBackground";
import FloatingPhotos from "./components/FloatingPhotos";
import ValentineEnvelope from "./components/ValentineEnvelope";

export default function App() {
  return (
    <div className="min-h-screen relative">
      <HeartsBackground count={22} />

      <FloatingPhotos
        photos={[
          "/her/mi.png",
          "/her/mi2.png",
          "/her/mi3.png",
          "/her/mi4.png",
          "/her/mi5.png",
        ]}
        showMs={5500}
        gapMs={100}
      />

      <div className="relative z-20">
        <ValentineEnvelope />
      </div>
    </div>
  );
}
