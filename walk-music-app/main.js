// HTMLからボタン要素を取得
const startButton = document.getElementById('start-button');

// Web Audio APIの準備
// AudioContextは、音を処理するための「作業場」のようなもの
let audioContext; 

// 音の源（オシレーター）と音量調整（ゲイン）を格納する変数
let oscillator;
let gainNode;

// ボタンがクリックされた時の処理
startButton.addEventListener('click', () => {
    if (!audioContext) {
        // まだAudioContextが作られていなければ、新しく作成する
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 音が鳴っているかチェック
    if (oscillator) {
        // 鳴っていれば停止する
        oscillator.stop();
        oscillator = null;
        startButton.textContent = '音を鳴らす';
    } else {
        // 鳴っていなければ音を作成して鳴らす
        
        // 1. 音の源（オシレーター）を作成
        oscillator = audioContext.createOscillator();
        // 2. 音量調整ノードを作成
        gainNode = audioContext.createGain();

        // 3. 接続：オシレーター → ゲイン → スピーカー（destination）
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 4. 音の設定
        oscillator.type = 'sine'; // サイン波（ピーという澄んだ音）
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440Hz (ラの音)
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // 音量を50%に

        // 5. 再生開始！
        oscillator.start();
        startButton.textContent = '音を止める';
    }
});
// HTMLのspan要素を取得
const accelX = document.getElementById('accel-x');
const accelY = document.getElementById('accel-y');
const accelZ = document.getElementById('accel-z');

// センサーへのアクセス許可を求める関数
function requestDeviceMotionEventPermission() {
    // iOS 13以降向けの対応
    if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotionEvent);
                }
            })
            .catch(console.error);
    } else {
        // その他のブラウザ
        window.addEventListener('devicemotion', handleMotionEvent);
    }
}

// センサーの値が変化した時に呼ばれる関数
function handleMotionEvent(event) {
    const acceleration = event.accelerationIncludingGravity;
    
    // 値を画面に表示（小数点以下2桁に丸める）
    accelX.textContent = acceleration.x.toFixed(2);
    accelY.textContent = acceleration.y.toFixed(2);
    accelZ.textContent = acceleration.z.toFixed(2);
}

// 最初のクリックでセンサーへのアクセス許可を求める
// (ユーザー操作がないと許可ダイアログは出せないため)
startButton.addEventListener('click', requestDeviceMotionEventPermission, { once: true });