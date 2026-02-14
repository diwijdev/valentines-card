import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ValentineEnvelope() {
  const [phase, setPhase] = useState("front"); // "front" | "back" | "open"
  const [busy, setBusy] = useState(false);

  const [letterSide, setLetterSide] = useState("message"); // "message" | "question"
  const [answer, setAnswer] = useState(null);

  const noAreaRef = useRef(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noDodges, setNoDodges] = useState(0);

  // ========= MEME / SFX COMBOS =========
  const COMBO_SETS = {
    chaseNo: [
      { sfx: "/memes/avatar-fall.mp3", img: "/memes/dog-crying.mp4" },
      { sfx: "/memes/faaah.mp3", img: "/memes/dog-sun.gif" },
      { sfx: "/memes/faaah.mp3", img: "/memes/noo-cat.gif" },
      { sfx: "/memes/vine-boom.mp3", img: "/memes/monkey-think.gif" },
      { sfx: "/memes/vine-boom.mp3", img: "/memes/sus-cat.png" },
      { sfx: "/memes/no-no.mp3", img: "/memes/no-no.gif" },
    ],
    hoverYes: [
      { sfx: "/memes/inlove-romance.mp3", img: "/memes/rose-cat.gif" },
      { sfx: "/memes/happy-happy.mp4", img: "/memes/happy-happy.mp4" },
      { sfx: "/memes/yeah-boixd.mp3", img: "/memes/e-boy.mp4" },
    ],
    yesClick: [
      { sfx: "/memes/inlove-romance.mp3", img: "/memes/kissing-cat.mp4"},
    ],
  };

  // meme media displayed ABOVE the letter
  const [memeImg, setMemeImg] = useState(null);     // string | null (gif/png/jpg)
  const [memeVideo, setMemeVideo] = useState(null); // string | null (mp4/webm/mov)

  const audioRef = useRef(null);
  const lastPlayedRef = useRef({});
  const memeTokenRef = useRef(0); // helps prevent old timeouts clearing new memes

  const isVideoPath = (p) => typeof p === "string" && /\.(mp4|webm|mov)$/i.test(p);

  const playSfx = async (src, volume = 0.8, onEnded) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const a = new Audio(src);
      a.volume = volume;

      // fire callback when sound ends (so meme can fade then)
      if (onEnded) a.addEventListener("ended", onEnded, { once: true });

      audioRef.current = a;
      await a.play();
      return a;
    } catch {
      // ignore autoplay restrictions etc.
      return null;
    }
  };

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const clearMeme = () => {
    setMemeImg(null);
    setMemeVideo(null);
  };

  const playComboFrom = async (
    setName,
    { cooldownMs = 700, volume = 0.75, minShowMs = 900 } = {}
  ) => {
    const set = COMBO_SETS[setName] ?? [];
    if (!set.length) return;

    const now = Date.now();
    const last = lastPlayedRef.current[setName] ?? 0;
    if (now - last < cooldownMs) return;
    lastPlayedRef.current[setName] = now;

    const combo = pickRandom(set);

    // new meme token for this combo
    const token = ++memeTokenRef.current;

    // show media (if any) ABOVE the letter
    clearMeme();

    // choose media source: prefer combo.img; if none, use combo.video
    const mediaSrc = combo.img || combo.video;
    if (mediaSrc) {
      if (isVideoPath(mediaSrc)) setMemeVideo(mediaSrc);
      else setMemeImg(mediaSrc);
    }

    // ensure meme stays at least minShowMs, and until sound ends (if there is sound)
    let minTimerDone = false;
    const minTimer = window.setTimeout(() => {
      minTimerDone = true;
      // if there was no sfx OR sfx already ended, clear now (guarded by token)
      // (we’ll let the onEnded handle it when there *is* audio)
      if (!combo.sfx && memeTokenRef.current === token) clearMeme();
    }, minShowMs);

    if (combo.sfx) {
      // when sound ends, fade meme out (but not before minShowMs)
      await playSfx(combo.sfx, volume, () => {
        // guard against old callbacks
        if (memeTokenRef.current !== token) return;

        const finish = () => {
          if (memeTokenRef.current === token) clearMeme();
        };

        if (minTimerDone) finish();
        else {
          // wait until minShowMs has elapsed
          const remaining = Math.max(0, minShowMs - (Date.now() - now));
          window.setTimeout(finish, remaining);
        }
      });
    }

    // cleanup min timer if a new meme starts quickly
    // (not strictly necessary, but avoids extra timers)
    return () => window.clearTimeout(minTimer);
  };

  function moveNoButton() {
    // meme + sfx while chasing "No"
    playComboFrom("chaseNo", { cooldownMs: 650, volume: 0.75, minShowMs: 1000 });

    const area = noAreaRef.current;
    if (!area) return;

    const rect = area.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - 140);
    const maxY = Math.max(0, rect.height - 56);

    const x = Math.random() * maxX - maxX / 2;
    const y = Math.random() * maxY - maxY / 2;

    setNoPos({ x, y });
    setNoDodges((n) => n + 1);
  }

  // ========= ENVELOPE OPEN LOGIC =========
  const onOpen = () => {
    if (busy) return;

    if (phase === "front") {
      setBusy(true);
      setPhase("back");

      setTimeout(() => setPhase("open"), 1600);
      setTimeout(() => setBusy(false), 2200);
      return;
    }

    if (phase === "back") setPhase("open");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setPhase("front");
        setLetterSide("message");
        setAnswer(null);
        clearMeme();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const preserve3d = { transformStyle: "preserve-3d" };
  const backfaceHidden = { backfaceVisibility: "hidden" };
  const letterCanInteract = phase === "open";

  return (
    <div className="min-h-screen grid place-items-center p-6">
      {/* ✅ bigger envelope container */}
      <div
        className="w-[min(94vw,860px)] aspect-[3/2] [perspective:1600px] select-none"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
        aria-label="Open envelope"
      >
        <motion.div
          className="relative w-full h-full"
          style={preserve3d}
          animate={{ rotateY: phase === "front" ? 0 : 180 }}
          transition={{ duration: 1.6, ease: [0.25, 1, 0.25, 1] }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-[28px] overflow-hidden shadow-2xl"
            style={backfaceHidden}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-rose-200 via-pink-200 to-rose-100" />

            <div className="absolute inset-0">
              <div
                className="absolute left-0 right-0 bottom-0 h-[70%] bg-rose-300/40"
                style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 35%)" }}
              />
              <div
                className="absolute left-0 bottom-0 top-[25%] w-[55%] bg-rose-400/25"
                style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
              />
              <div
                className="absolute right-0 bottom-0 top-[25%] w-[55%] bg-rose-400/20"
                style={{ clipPath: "polygon(100% 0, 0 50%, 100% 100%)" }}
              />
            </div>

            <div className="absolute left-6 top-6 sm:left-8 sm:top-8">
              <div className="rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 px-4 py-3 shadow-lg">
                <p className="text-xl sm:text-2xl font-semibold text-rose-950 leading-none">
                  Emi
                </p>
              </div>
            </div>

            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={false}
              animate={{ scale: busy ? 0.98 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-500/90 shadow-lg grid place-items-center">
                <span className="text-white text-3xl sm:text-4xl">❤</span>
              </div>
            </motion.div>

            <div className="absolute -left-24 -top-24 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-[28px] overflow-hidden shadow-2xl"
            style={{ ...backfaceHidden, transform: "rotateY(180deg)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-rose-200 via-pink-200 to-rose-100" />

            <motion.div
              className="absolute left-0 right-0 top-0 h-[68%] origin-top z-30"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 72%)",
                background:
                  "linear-gradient(180deg, rgba(244,63,94,0.28), rgba(251,207,232,0.9))",
                boxShadow: "0 20px 35px rgba(0,0,0,0.12)",
              }}
              animate={{ rotateX: phase === "open" ? -155 : 0 }}
              transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
            />

            {/* ✅ MEME DISPLAY ABOVE LETTER (not inside it) */}
            <AnimatePresence>
              {(memeImg || memeVideo) && phase === "open" && (
                <motion.div
                  key={memeImg || memeVideo}
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-1/2 top-6 -translate-x-1/2 z-[60] w-[450px] h-[450px] sm:w-[390px] sm:h-[390px] rounded-2xl overflow-hidden shadow-2xl bg-black/10 border border-black/10"
                >
                  {memeImg ? (
                    <img src={memeImg} alt="meme" className="w-full h-full object-cover" />
                  ) : (
                    <video
                      src={memeVideo}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back folds */}
            <div className="absolute inset-0 z-10">
              <div
                className="absolute left-0 bottom-0 top-[28%] w-[55%] bg-rose-400/20"
                style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
              />
              <div
                className="absolute right-0 bottom-0 top-[28%] w-[55%] bg-rose-400/18"
                style={{ clipPath: "polygon(100% 0, 0 50%, 100% 100%)" }}
              />
              <div
                className="absolute left-0 right-0 bottom-0 h-[70%] bg-rose-300/35"
                style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 35%)" }}
              />
            </div>

            {/* ✅ slightly smaller letter so envelope shows more behind */}
            <div className="absolute inset-0 flex items-end justify-center pb-4 z-20">
              <motion.div
                className="relative w-[86%] h-[82%] sm:w-[84%] sm:h-[84%] [perspective:1400px]"
                initial={false}
                animate={{
                  y: phase === "open" ? 0 : 80,
                  opacity: phase === "open" ? 1 : 0,
                  scale: phase === "open" ? 1 : 0.98,
                }}
                transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={preserve3d}
                  animate={{ rotateY: letterSide === "message" ? 0 : 180 }}
                  transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {/* FRONT: MESSAGE */}
                  <div
                    className={`absolute inset-0 rounded-[22px] bg-white/92 shadow-xl border border-white/70 overflow-hidden ${
                      letterCanInteract ? "cursor-pointer" : "pointer-events-none"
                    }`}
                    style={backfaceHidden}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!letterCanInteract) return;
                      setLetterSide("question");
                    }}
                  >
                    <div className="p-6 sm:p-8 text-rose-950 h-full flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xl sm:text-2xl font-semibold">My Em yêu,</p>
                        </div>
                        <span className="text-xl sm:text-2xl">💌</span>
                      </div>

                      <div className="mt-5 text-sm sm:text-base leading-relaxed text-rose-900/90 space-y-3 overflow-auto pr-1">
                        <p>
                            Nhân ngày đẹp trời này, anh muốn nói với em vài điều.
                        </p>

                        <p>
                            Trước hết, chắc chắn ngày hôm nay đâu có đẹp vậy nếu trong cuộc đời anh không có em.
                        </p>

                        <p>
                            Mỗi ngày trôi qua với anh đều là một hành trình bất ngờ, chỉ vì cái tính duyên dáng, cuốn hút của em đó.
                        </p>

                        <p>
                            Ngay cả những ngày bình thường nhất cũng sáng hơn hẳn khi có em bên cạnh 
                            <span className="italic text-rose-700/80">
                            {" "} (chắc tại… nụ cười của em đó).
                            </span>
                        </p>

                        <p>
                            Giọng nói ngọt ngào của em nghe như mật rót vào tai anh vậy đó, cưng à. 
                            Anh đúng là fan bự nhất của em luôn.
                        </p>

                        <p className="font-medium text-rose-800">
                            Anh chỉ mong mấy bông hồng này có thể thay anh nói lên được một phần nhỏ xíu 
                            tình yêu anh dành cho em thôi. 🌹
                        </p>
                        <p>Okay… now flip this letter. I have a question for you.</p>
                      </div>

                      <div className="mt-auto pt-5 text-sm sm:text-base font-medium">— Diwij</div>
                      <p className="text-rose-700/70 text-sm mt-1">(tap to flip this letter)</p>
                    </div>
                  </div>

                  {/* BACK: QUESTION */}
                  <div
                    className={`absolute inset-0 rounded-[22px] bg-white/92 shadow-xl border border-white/70 overflow-hidden ${
                      letterCanInteract ? "" : "pointer-events-none"
                    }`}
                    style={{ ...backfaceHidden, transform: "rotateY(180deg)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 sm:p-8 h-full flex flex-col items-center justify-center text-center text-rose-950">
                      <p className="mt-3 text-rose-700/70 text-sm sm:text-base">Em yêu</p>
                      <p className="text-2xl sm:text-3xl font-semibold">Will you be my Valentine?</p>

                      <div ref={noAreaRef} className="relative mt-8 w-full max-w-[520px] h-[140px]">
                        <div className="flex justify-center gap-6">
                          <button
                            className="px-7 py-3 rounded-full bg-rose-500 text-white font-semibold shadow-lg hover:bg-rose-600 active:scale-[0.98] transition"
                            onMouseEnter={() =>
                              playComboFrom("hoverYes", { cooldownMs: 900, volume: 0.6, minShowMs: 1000 })
                            }
                            onClick={() => {
                              setAnswer("yes");
                              playComboFrom("yesClick", { cooldownMs: 0, volume: 0.9, minShowMs: 1200 });
                            }}
                            type="button"
                          >
                            Yes 💗
                          </button>

                          <motion.button
                            type="button"
                            className="px-7 py-3 rounded-full bg-white text-rose-600 font-semibold shadow-lg border border-rose-200 hover:bg-rose-50"
                            animate={{ x: noPos.x, y: noPos.y }}
                            transition={{ type: "spring", stiffness: 500, damping: 26 }}
                            onMouseEnter={moveNoButton}
                            onMouseMove={moveNoButton}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              moveNoButton();
                            }}
                            onTouchStart={(e) => {
                              e.preventDefault();
                              moveNoButton();
                            }}
                          >
                            No 🙃
                          </motion.button>
                        </div>
                      </div>

                      <button
                        className="mt-7 text-sm text-rose-700/70 hover:text-rose-800 underline underline-offset-4"
                        onClick={() => {
                          setAnswer(null);
                          setLetterSide("message");
                        }}
                        type="button"
                      >
                        Flip back to the letter
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full bg-white/20 blur-3xl z-0" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
