"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording" | "error";

export interface VoiceClip {
  blob: Blob;
  /** Object URL for playback. The caller owns it and must revoke it. */
  url: string;
  durationMs: number;
  mimeType: string;
}

interface UseVoiceRecorderOptions {
  /** Hard ceiling; recording stops itself when reached. */
  maxMs: number;
  onComplete: (clip: VoiceClip) => void;
}

/** How many level samples the meter keeps on screen. */
const BARS = 28;
/** Level sampling cadence — fast enough to look live, slow enough to be cheap. */
const SAMPLE_MS = 90;

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return (
    candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? ""
  );
}

/**
 * Microphone recording with a hard time limit.
 *
 * Everything the browser handed us — the stream, the audio graph, the timers —
 * is released on stop, cancel and unmount, so the recording indicator never
 * stays lit after the user is done.
 */
export function useVoiceRecorder({ maxMs, onComplete }: UseVoiceRecorderOptions) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const sampleRef = useRef<number | null>(null);
  const discardRef = useRef(false);

  // Latest callback without re-creating `start` on every parent render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const teardown = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (sampleRef.current !== null) {
      window.clearInterval(sampleRef.current);
      sampleRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    void audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => teardown, [teardown]);

  const stop = useCallback(() => {
    discardRef.current = false;
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    discardRef.current = true;
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    } else {
      teardown();
      setStatus("idle");
      setElapsedMs(0);
      setLevels([]);
    }
  }, [teardown]);

  const start = useCallback(async () => {
    if (status === "recording" || status === "requesting") return;

    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("error");
      setError("This browser cannot record audio.");
      return;
    }

    setStatus("requesting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permissionError) {
      setStatus("error");
      setError(
        (permissionError as Error)?.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow it in your browser settings to record."
          : "No microphone was available.",
      );
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    discardRef.current = false;

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const durationMs = Math.min(Date.now() - startedAtRef.current, maxMs);
      const discarded = discardRef.current;
      const type = recorder.mimeType || mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });

      teardown();
      setStatus("idle");
      setElapsedMs(0);
      setLevels([]);

      // Ignore accidental taps that produced nothing worth hearing.
      if (!discarded && blob.size > 0 && durationMs >= 400) {
        onCompleteRef.current({
          blob,
          url: URL.createObjectURL(blob),
          durationMs,
          mimeType: type,
        });
      }
    };

    // Live level meter, so the person can see the mic is actually hearing them.
    try {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (AudioCtor) {
        const context = new AudioCtor();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        context.createMediaStreamSource(stream).connect(analyser);
        audioContextRef.current = context;
        analyserRef.current = analyser;
      }
    } catch {
      // A missing meter is cosmetic; recording still works without it.
    }

    startedAtRef.current = Date.now();
    recorder.start();
    setStatus("recording");
    setElapsedMs(0);
    setLevels([]);

    tickRef.current = window.setInterval(() => {
      const next = Date.now() - startedAtRef.current;
      setElapsedMs(next);
      if (next >= maxMs) stop();
    }, 100);

    sampleRef.current = window.setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) {
        setLevels((current) => [...current, 0.25].slice(-BARS));
        return;
      }

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(data);

      let peak = 0;
      for (const value of data) {
        peak = Math.max(peak, Math.abs(value - 128) / 128);
      }

      setLevels((current) => [...current, Math.min(1, peak * 2.4)].slice(-BARS));
    }, SAMPLE_MS);
  }, [status, maxMs, stop, teardown]);

  return {
    status,
    elapsedMs,
    levels,
    error,
    isRecording: status === "recording",
    isRequesting: status === "requesting",
    start,
    stop,
    cancel,
    barCount: BARS,
  };
}

export default useVoiceRecorder;
