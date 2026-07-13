import { useState } from 'react';
import { renderProjectToWav } from '../../audio/render';
import { PixelButton } from '../../components/PixelButton';
import { useProjectStore } from '../../store/projectStore';

/** プロジェクトを WAV に書き出すボタン（ヘッダー用） */
export function WavExportButton() {
  const [rendering, setRendering] = useState(false);

  const exportWav = async () => {
    setRendering(true);
    try {
      const project = useProjectStore.getState().project;
      const blob = await renderProjectToWav(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title || 'untitled'}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`WAV の書き出しに失敗しました: ${error instanceof Error ? error.message : error}`);
    } finally {
      setRendering(false);
    }
  };

  return (
    <PixelButton onClick={() => void exportWav()} disabled={rendering}>
      {rendering ? '書出中…' : '書出'}
    </PixelButton>
  );
}
