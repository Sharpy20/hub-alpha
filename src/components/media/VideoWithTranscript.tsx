import type { TranscriptChapter } from "@/lib/data/video/transcripts";

type Props = {
  /** Path under /public, e.g. "/video/where-the-data-goes.mp4". */
  src: string;
  /** Describes the film for screen readers announcing the player. */
  label: string;
  transcript: TranscriptChapter[];
};

/**
 * A silent, text-on-screen film plus its transcript. Both films carry no audio
 * track, so the transcript is the entire text alternative - without it a screen
 * reader user gets nothing at all from the player.
 *
 * No client JS: the disclosure is a native <details>, so this renders fine in a
 * server component and works with JS off.
 */
export function VideoWithTranscript({ src, label, transcript }: Props) {
  const filename = src.split("/").pop();

  return (
    <>
      <video
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-lg bg-black"
        aria-label={label}
      >
        <source src={src} type="video/mp4" />
        Your browser cannot play this video. Download it instead:{" "}
        <a href={src}>{filename}</a>
      </video>

      <details className="border border-gray-200 rounded-lg">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-nhs-blue hover:bg-nhs-pale-grey rounded-lg">
          Read what the video says
        </summary>
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-200">
          <p className="text-xs text-nhs-mid-grey">
            The film has no narration - every word is on screen. This is what
            appears, in order.
          </p>
          {transcript.map((chapter) => (
            <div key={chapter.time}>
              <h3 className="text-sm font-semibold text-nhs-black">
                <span className="text-nhs-mid-grey font-normal tabular-nums mr-2">
                  {chapter.time}
                </span>
                {chapter.title}
              </h3>
              <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
                {chapter.lines.map((line, i) => (
                  <li key={i} className="text-sm text-nhs-dark-grey">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
