import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// PWAインストールプロンプトコンポーネント
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // beforeinstallpromptイベントをリッスン
    const handleBeforeInstallPrompt = (e: Event) => {
      // Chromeでデフォルトの挙動を抑制
      e.preventDefault();
      // 後で使用するためにイベントを保存
      setDeferredPrompt(e);
      // インストールボタンを表示
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // appinstalledイベントをリッスン
    const handleAppInstalled = () => {
      // インストールボタンを非表示
      setShowInstallButton(false);
      // イベントをクリア
      setDeferredPrompt(null);
      console.log('アプリがインストールされました');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // イベントリスナーのクリーンアップ
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // インストールプロンプトを表示
  const handleInstallClick = () => {
    if (!deferredPrompt) {
      return;
    }

    // インストールプロンプトを表示
    deferredPrompt.prompt();

    // ユーザーの選択を待機
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('ユーザーがインストールを承認しました');
      } else {
        console.log('ユーザーがインストールをキャンセルしました');
      }
      // イベントは一度しか使用できないのでクリア
      setDeferredPrompt(null);
      setShowInstallButton(false);
    });
  };

  // インストールボタンを表示
  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <Button 
        onClick={handleInstallClick} 
        className="flex items-center gap-2 bg-primary text-white shadow-lg rounded-full px-4 py-2"
      >
        <Download className="h-4 w-4" />
        <span>アプリをインストール</span>
      </Button>
    </div>
  );
}