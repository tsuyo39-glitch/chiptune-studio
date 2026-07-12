import { PixelSlider } from '../../components/PixelSlider';
import type { TrackId } from '../../model/project';
import { useProjectStore } from '../../store/projectStore';

const TRACK_LABELS: Record<TrackId, string> = {
  piano: 'ピアノ',
  guitar: 'ギター',
  bass: 'ベース',
  drums: 'ドラム',
};

interface TrackTabsProps {
  activeTrack: TrackId;
  onSelect: (trackId: TrackId) => void;
}

/** M / S 用の小型トグルボタン */
function SmallToggle({
  label,
  title,
  on,
  onClass,
  onClick,
}: {
  label: string;
  title: string;
  on: boolean;
  onClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={on}
      onClick={onClick}
      className={`h-7 w-7 border-2 border-ink font-num text-[10px] leading-none select-none ${
        on ? onClass : 'bg-paper text-ink'
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
    >
      {label}
    </button>
  );
}

export function TrackTabs({ activeTrack, onSelect }: TrackTabsProps) {
  const tracks = useProjectStore((s) => s.project.tracks);
  const setTrackVolume = useProjectStore((s) => s.setTrackVolume);
  const toggleMute = useProjectStore((s) => s.toggleMute);
  const toggleSolo = useProjectStore((s) => s.toggleSolo);

  return (
    <div className="flex flex-wrap gap-2">
      {tracks.map((track) => {
        const active = track.id === activeTrack;
        return (
          <div
            key={track.id}
            className={`flex items-center gap-2 border-2 border-ink px-2 py-1 ${
              active ? 'bg-tone shadow-(--shadow-pixel)' : 'bg-paper'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(track.id)}
              className={`px-1 select-none ${track.mute ? 'opacity-40' : ''} ${
                active ? '' : 'text-shade'
              } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
            >
              {TRACK_LABELS[track.id]}
            </button>
            <SmallToggle
              label="M"
              title="ミュート"
              on={track.mute}
              onClass="bg-accent text-paper"
              onClick={() => toggleMute(track.id)}
            />
            <SmallToggle
              label="S"
              title="ソロ"
              on={track.solo}
              onClass="bg-gold text-ink"
              onClick={() => toggleSolo(track.id)}
            />
            <PixelSlider
              value={Math.round(track.volume * 100)}
              min={0}
              max={100}
              onChange={(v) => setTrackVolume(track.id, v / 100)}
              aria-label={`${TRACK_LABELS[track.id]}の音量`}
              className="w-24"
            />
          </div>
        );
      })}
    </div>
  );
}
