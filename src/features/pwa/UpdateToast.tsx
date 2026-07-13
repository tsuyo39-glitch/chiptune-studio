import { useRegisterSW } from 'virtual:pwa-register/react';
import { PixelButton } from '../../components/PixelButton';

// 新バージョン検出時にトーストを出し、ユーザー操作でリロードする（§7）。
// 自動リロードで編集中データを飛ばさない。
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-3 border-2 border-ink bg-paper px-4 py-3 shadow-(--shadow-pixel)">
      <span className="text-sm">新しいバージョンがあります</span>
      <PixelButton variant="accent" onClick={() => void updateServiceWorker(true)}>
        更新
      </PixelButton>
      <PixelButton onClick={() => setNeedRefresh(false)}>あとで</PixelButton>
    </div>
  );
}
