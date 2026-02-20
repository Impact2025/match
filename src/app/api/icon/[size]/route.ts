import { ImageResponse } from "next/og"
import React from "react"

export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params
  const s = parseInt(sizeParam) || 192

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: s,
          height: s,
          background: "#f97316",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      React.createElement(
        "svg",
        {
          width: Math.round(s * 0.55),
          height: Math.round(s * 0.55),
          viewBox: "0 0 24 24",
          fill: "white",
        },
        React.createElement("path", {
          d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
        })
      )
    ),
    { width: s, height: s }
  )
}
