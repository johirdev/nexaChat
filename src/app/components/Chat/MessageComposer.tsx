"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  Check,
  ImagePlus,
  Mic,
  Pause,
  Play,
  SendHorizonal,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import useVoiceRecorder, { type VoiceClip } from "@/src/hooks/useVoiceRecorder";
import StickerPicker from "./StickerPicker";

const MAX_HEIGHT = 148;
/** Hard ceiling on a voice note. The recorder stops itself here. */
const MAX_RECORDING_MS = 40_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 6;

type Attachment =
  | { kind: "image"; id: string; url: string; name: string; size: number }
  | { kind: "voice"; id: string; url: string; durationMs: number };

interface MessageComposerProps {
  /**
   * Not read directly — the thread is keyed by conversation id, so switching
   * chats remounts this component and a half-typed draft never leaks across.
   * Kept in the props so that contract is explicit at the call site.
   */
  conversationId: string;
  recipientName: string;
  disabled?: boolean;
  /** Shown above the field — e.g. a send failure or an offline socket. */
  notice?: string | null;
  onSend: (text: string) => void;
}

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `att-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Deterministic bars so a clip's waveform does not reshuffle on every render. */
function waveformFor(seed: string, bars = 18): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return Array.from({ length: bars }, (_, i) => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    return 0.25 + ((hash >>> (i % 8)) % 100) / 133;
  });
}

/**
 * The message composer: text, stickers, image attachments and voice notes.
 *
 * Stickers are emoji and travel inside the message text, so they send for real.
 * Images and voice notes are captured and previewed entirely in the browser —
 * the NexaChat API accepts `{ conversationId, text }` and exposes no upload
 * endpoint, so the tray is honest about being a preview rather than pretending
 * the file left the device.
 */
export default function MessageComposer({
  recipientName,
  disabled,
  notice,
  onSend,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isStickersOpen, setIsStickersOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const addVoiceClip = useCallback((clip: VoiceClip) => {
    setAttachments((current) => [
      ...current,
      {
        kind: "voice",
        id: newId(),
        url: clip.url,
        durationMs: clip.durationMs,
      },
    ]);
  }, []);

  const recorder = useVoiceRecorder({
    maxMs: MAX_RECORDING_MS,
    onComplete: addVoiceClip,
  });

  // Grow with the content up to a ceiling, then scroll inside the field.
  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, MAX_HEIGHT)}px`;
  }, [text]);

  // Object URLs are a manual allocation; release them when the composer goes.
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(
    () => () => {
      attachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
      audioRef.current?.pause();
    },
    [],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
    setPlayingId((current) => (current === id ? null : current));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    audioRef.current?.pause();
    setPlayingId(null);
  }, []);

  const handleFiles = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(event.target.files ?? []);
      // Let the same file be chosen twice in a row.
      event.target.value = "";
      if (picked.length === 0) return;

      const accepted: Attachment[] = [];
      let rejection: string | null = null;

      for (const file of picked) {
        if (!file.type.startsWith("image/")) {
          rejection = "Only images can be attached right now.";
          continue;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          rejection = `${file.name} is larger than 5 MB.`;
          continue;
        }
        accepted.push({
          kind: "image",
          id: newId(),
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      }

      setAttachments((current) => {
        const room = MAX_IMAGES - current.filter((a) => a.kind === "image").length;
        if (accepted.length > room) {
          rejection = `You can attach up to ${MAX_IMAGES} images.`;
          accepted.slice(room).forEach((item) => URL.revokeObjectURL(item.url));
        }
        return [...current, ...accepted.slice(0, Math.max(room, 0))];
      });

      setFileError(rejection);
    },
    [],
  );

  const togglePlayback = useCallback(
    (attachment: Attachment) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (playingId === attachment.id) {
        audio.pause();
        setPlayingId(null);
        return;
      }

      audio.src = attachment.url;
      void audio.play().then(
        () => setPlayingId(attachment.id),
        () => setPlayingId(null),
      );
    },
    [playingId],
  );

  const insertSticker = useCallback((sticker: string) => {
    setText((current) => (current ? `${current} ${sticker}` : sticker));
    textareaRef.current?.focus();
  }, []);

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    setIsStickersOpen(false);
    // Previews are local only, so clear them with the message they accompanied.
    clearAttachments();
  }, [text, disabled, onSend, clearAttachments]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends; Shift+Enter (and IME composition) inserts a newline.
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const canSend = text.trim().length > 0 && !disabled;
  const imageCount = attachments.filter((a) => a.kind === "image").length;

  const recordingBars = useMemo(() => {
    const padded = [...recorder.levels];
    while (padded.length < recorder.barCount) padded.unshift(0);
    return padded;
  }, [recorder.levels, recorder.barCount]);

  const banner = fileError ?? recorder.error ?? notice ?? null;

  return (
    <div className="cw-composer">
      {banner && <p className="cw-banner">{banner}</p>}

      {/* ------------------------------------------------ attachment tray */}
      {attachments.length > 0 && (
        <div className="cw-tray">
          <p className="cw-tray-head">
            <span>
              {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
            </span>
            <button type="button" className="cw-tray-clear" onClick={clearAttachments}>
              Clear all
            </button>
            <span className="cw-tray-note">Preview only — uploads need a server endpoint</span>
          </p>

          <div className="cw-tray-items">
            {attachments.map((attachment) =>
              attachment.kind === "image" ? (
                <div className="cw-att" key={attachment.id}>
                  {/* Blob URL of a file the user just picked — next/image cannot
                      optimise it, and there is nothing to optimise. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={attachment.url} alt={attachment.name} />
                  <span className="cw-att-name">{attachment.name}</span>
                  <button
                    type="button"
                    className="cw-att-remove"
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="cw-att is-voice" key={attachment.id}>
                  <button
                    type="button"
                    className="cw-voice-play"
                    onClick={() => togglePlayback(attachment)}
                    aria-label={
                      playingId === attachment.id ? "Pause voice note" : "Play voice note"
                    }
                  >
                    {playingId === attachment.id ? (
                      <Pause size={13} />
                    ) : (
                      <Play size={13} />
                    )}
                  </button>

                  <span className="cw-voice-body">
                    <span className="cw-wave" aria-hidden="true">
                      {waveformFor(attachment.id).map((height, i) => (
                        <i key={i} style={{ height: `${height * 100}%` }} />
                      ))}
                    </span>
                    <span className="cw-voice-meta">
                      Voice note · {formatClock(attachment.durationMs)}
                    </span>
                  </span>

                  <button
                    type="button"
                    className="cw-att-remove"
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label="Remove voice note"
                  >
                    <X size={12} />
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- input row */}
      {recorder.isRecording ? (
        <div className="cw-rec" role="status" aria-live="polite">
          <span className="cw-rec-dot" aria-hidden="true" />
          <span className="cw-rec-time">
            {formatClock(recorder.elapsedMs)}{" "}
            <span>/ {formatClock(MAX_RECORDING_MS)}</span>
          </span>

          <span className="cw-rec-wave" aria-hidden="true">
            {recordingBars.map((level, i) => (
              <i key={i} style={{ height: `${Math.max(level, 0.06) * 100}%` }} />
            ))}
          </span>

          <span className="cw-rec-limit" aria-hidden="true">
            <i style={{ width: `${(recorder.elapsedMs / MAX_RECORDING_MS) * 100}%` }} />
          </span>

          <button
            type="button"
            className="cw-tool"
            onClick={recorder.cancel}
            aria-label="Discard recording"
            title="Discard"
          >
            <Trash2 size={17} />
          </button>
          <button
            type="button"
            className="cw-send"
            onClick={recorder.stop}
            aria-label="Finish recording"
            title="Finish"
          >
            <Check size={17} />
          </button>
        </div>
      ) : (
        <div className="cw-composer-inner">
          <span className="cw-tools">
            <button
              type="button"
              data-sticker-toggle
              className={`cw-tool${isStickersOpen ? " is-on" : ""}`}
              onClick={() => setIsStickersOpen((open) => !open)}
              aria-label="Stickers"
              aria-expanded={isStickersOpen}
              title="Stickers"
              disabled={disabled}
            >
              <Smile size={18} />
            </button>

            <button
              type="button"
              className="cw-tool"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach an image"
              title="Attach an image"
              disabled={disabled || imageCount >= MAX_IMAGES}
            >
              <ImagePlus size={18} />
            </button>

            <button
              type="button"
              className="cw-tool"
              onClick={recorder.start}
              aria-label="Record a voice note"
              title="Record a voice note (40s max)"
              disabled={disabled || recorder.isRequesting}
            >
              <Mic size={18} />
            </button>
          </span>

          <textarea
            ref={textareaRef}
            className="cw-textarea"
            rows={1}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${recipientName}`}
            aria-label={`Message ${recipientName}`}
            disabled={disabled}
            autoFocus
          />

          <button
            type="button"
            className="cw-send"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
          >
            <SendHorizonal size={17} />
          </button>
        </div>
      )}

      {isStickersOpen && !recorder.isRecording && (
        <StickerPicker
          onPick={insertSticker}
          onClose={() => setIsStickersOpen(false)}
        />
      )}

      <p className="cw-composer-hint">
        <span>
          <kbd>Enter</kbd> to send &middot; <kbd>Shift</kbd>+<kbd>Enter</kbd> for a
          new line
        </span>
        {recorder.isRequesting && <span>Waiting for the microphone…</span>}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="cw-sr"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* One element plays every clip; only one can be playing at a time. */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        onPause={() => setPlayingId(null)}
        hidden
      />
    </div>
  );
}
