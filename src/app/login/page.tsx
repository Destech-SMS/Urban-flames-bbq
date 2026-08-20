"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Flame } from "lucide-react"

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative flex items-center justify-center">
            <img
              src="/image.png"
              alt="Urban Flame BBQ"
              className="h-44 w-auto object-contain animate-bounce drop-shadow-[0_0_25px_rgba(234,88,12,0.5)]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-orange-500 uppercase animate-pulse">
            <Flame className="size-4 animate-bounce text-orange-500" /> Loading Portal...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-zinc-950 text-zinc-100 animate-in fade-in duration-700">
      <div className="relative hidden lg:flex items-center justify-center bg-zinc-900/40 border-r border-zinc-800/80 p-12 overflow-hidden">
        <div className="absolute size-[450px] bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <img
          src="/image.png"
          alt="Urban Flame BBQ Logo"
          className="relative max-h-[75vh] w-auto object-contain transition-all duration-700 hover:scale-105 drop-shadow-[0_10px_25px_rgba(234,88,12,0.3)] animate-pulse"
        />
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10 justify-between animate-in fade-in slide-in-from-right-6 duration-700">
        <div className="flex justify-center items-center">
          <a href="#" className="group flex items-center justify-center">
            <img
              src="/image.png"
              alt="Urban Flame BBQ"
              className="h-12 w-auto object-contain transition-all duration-500 group-hover:scale-110 animate-pulse drop-shadow-[0_0_12px_rgba(234,88,12,0.4)]"
            />
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        <div className="text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Urban Flame BBQ. All rights reserved.
        </div>
      </div>
    </div>
  )
}