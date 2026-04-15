"use client"

import { useRef, useState } from "react"
import { openAiAssistant } from "./ai-assistant"

interface IrisSectionProps {
  color?: string
}

export function IrisSection({ color }: IrisSectionProps) {
  const brand = color ?? "#f97316"
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <section className="py-16 sm:py-24 border-t border-gray-100 overflow-hidden" id="iris">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Label */}
        <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: brand }}>
          AI-assistent
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 text-center mb-4">
          Maak kennis met Iris
        </h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-12 sm:mb-16 text-sm sm:text-base leading-relaxed">
          Iris is jouw persoonlijke AI-assistent op Vrijwilligersmatch. Ze beantwoordt vragen,
          helpt bij het vinden van de perfecte plek en begeleidt je door het platform.
        </p>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Video */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-950 shadow-2xl aspect-video">
            <video
              ref={videoRef}
              src="/iris-intro.mp4"
              poster="/iris-poster.png"
              playsInline
              onEnded={() => setPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* Play / pause overlay */}
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pauzeren" : "Afspelen"}
              className="absolute inset-0 flex items-center justify-center group"
            >
              {!playing && (
                <span className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
                  {/* Play icon */}
                  <svg className="w-7 h-7 ml-1" style={{ color: brand }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </button>

            {/* Duration badge */}
            {!playing && (
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                Intro video
              </span>
            )}
          </div>

          {/* Text + CTA */}
          <div className="flex flex-col gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" style={{ color: brand }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ),
                title: "Direct antwoord",
                desc: "Iris beantwoordt al je vragen over het platform, categorieën, en het matchproces.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" style={{ color: brand }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "Slimme suggesties",
                desc: "Gebaseerd op jouw profiel geeft Iris persoonlijke tips om de beste match te vinden.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" style={{ color: brand }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "24/7 beschikbaar",
                desc: "Altijd bereikbaar, op elk moment van de dag.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: brand + "15" }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}

            <button
              onClick={openAiAssistant}
              className="mt-2 self-start inline-flex items-center gap-2.5 px-6 py-3.5 text-white font-semibold rounded-xl transition-opacity hover:opacity-90 shadow-sm"
              style={{ backgroundColor: brand }}
            >
              {/* Sparkles icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zm14 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
              </svg>
              Chat met Iris
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
