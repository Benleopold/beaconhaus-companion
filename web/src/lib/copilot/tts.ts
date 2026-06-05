"use client";
import { useEffect, useState } from "react";

// Single-instance browser TTS (Web Speech API). The newest playback wins:
// starting a new one cancels any previous. Subscribers keep each message's
// play/stop button in sync.
type Listener = (playingId: string | null) => void;
const listeners = new Set<Listener>();
let playingId: string | null = null;

function set(id: string | null) {
  playingId = id;
  for (const l of listeners) l(id);
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
export function getPlayingId(): string | null {
  return playingId;
}
export function subscribeTTS(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function speak(id: string, text: string): void {
  if (!ttsSupported() || !text.trim()) return;
  window.speechSynthesis.cancel(); // newest wins: stop whatever was playing
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  u.onend = () => {
    if (playingId === id) set(null);
  };
  u.onerror = () => {
    if (playingId === id) set(null);
  };
  set(id);
  window.speechSynthesis.speak(u);
}
export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
  set(null);
}
export function toggleSpeak(id: string, text: string): void {
  if (playingId === id) stopSpeaking();
  else speak(id, text);
}

export function useTTS() {
  const [pid, setPid] = useState<string | null>(getPlayingId());
  useEffect(() => subscribeTTS(setPid), []);
  return { playingId: pid, toggle: toggleSpeak, stop: stopSpeaking, supported: ttsSupported() };
}
