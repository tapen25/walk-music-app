// HTMLの要素を取得
const startButton = document.getElementById('startButton');
const statusDiv = document.getElementById('status');

// --- 歩行検出のためのパラメータ ---
// この値より大きい加速度を「歩行」の候補とします（スマホの機種や持ち方で調整が必要）
const ACCELERATION_THRESHOLD = 11.5; 

// 一度検出したら、次の検出まで少し間を空けるためのフラグ
let isStepDetected = false;

// 開始ボタンが押されたときの処理
startButton.addEventListener('click', () => {
    // センサーへのアクセス許可をリクエスト (特にiPhoneで必要)
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    // 許可されたら、センサーのイベントリスナーを登録
                    window.addEventListener('devicemotion', handleMotion);
                    statusDiv.textContent = 'ステータス: センサー有効。歩いてください。';
                } else {
                    statusDiv.textContent = 'ステータス: センサーへのアクセスが拒否されました。';
                }
            })
            .catch(console.error);
    } else {
        // requestPermissionが不要なブラウザ（AndroidのChromeなど）の場合
        window.addEventListener('devicemotion', handleMotion);
        statusDiv.textContent = 'ステータス: センサー有効。歩いてください。';
    }

    // ボタンを無効化して、二重に処理が走らないようにする
    startButton.disabled = true;
});

// 加速度センサーが動いたときに呼ばれる関数
function handleMotion(event) {
    // もし既に歩行を検出した直後なら、処理を中断
    if (isStepDetected) {
        return;
    }

    // 重力を含めたXYZ軸の加速度を取得
    const acc = event.accelerationIncludingGravity;

    // XYZ軸の加速度を合成して、力の大きさを計算
    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

    // 力の大きさが、設定した閾値を超えたら「一歩」と判定
    if (magnitude > ACCELERATION_THRESHOLD) {
        console.log('Step! (Magnitude:', magnitude.toFixed(2), ')');
        statusDiv.textContent = '歩行を検知！';
        
        // 検出フラグを立てる
        isStepDetected = true;

        // 0.5秒後に、画面表示と検出フラグを元に戻す
        // これにより、一歩の揺れで複数回検出されるのを防ぐ
        setTimeout(() => {
            statusDiv.textContent = 'ステータス: センサー有効。歩いてください。';
            isStepDetected = false;
        }, 500); // 500ミリ秒 = 0.5秒
    }
}
