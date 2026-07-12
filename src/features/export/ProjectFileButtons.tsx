import { useRef } from 'react';
import { PixelButton } from '../../components/PixelButton';
import { parseProject, serializeProject } from '../../model/io';
import { useProjectStore } from '../../store/projectStore';

/** プロジェクトの .json 保存 / 読み込みボタン（ヘッダー用） */
export function ProjectFileButtons() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const project = useProjectStore.getState().project;
    const blob = new Blob([serializeProject(project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title || 'untitled'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 同じファイルを再選択できるようにする
    if (!file) return;
    const result = parseProject(await file.text());
    if (result.ok) {
      useProjectStore.getState().loadProject(result.project);
    } else {
      alert(`プロジェクトを読み込めませんでした:\n${result.errors.join('\n')}`);
    }
  };

  return (
    <div className="flex gap-2">
      <PixelButton onClick={download}>保存</PixelButton>
      <PixelButton onClick={() => fileInputRef.current?.click()}>読込</PixelButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFileSelected}
      />
    </div>
  );
}
