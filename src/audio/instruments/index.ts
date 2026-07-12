import type { TrackId } from '../../model/project';
import { playBass } from './bass';
import { playDrums } from './drums';
import { playGuitar } from './guitar';
import { playPiano } from './piano';
import type { InstrumentPlayer } from './types';

export const instruments: Record<TrackId, InstrumentPlayer> = {
  piano: playPiano,
  guitar: playGuitar,
  bass: playBass,
  drums: playDrums,
};

export type { InstrumentPlayer, PlayParams } from './types';
