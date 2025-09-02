window.addEventListener('DOMContentLoaded', () => {

    // --- 設定値 ---
    const STEP_THRESHOLD = 11.5; // 歩行検知のしきい値（歩きながら調整）
    const STEP_COOLDOWN = 350;   // 歩行検知のクールダウン時間 (ミリ秒)
    const BPM_SAMPLES = 4;       // BPM計算に使う直近の歩数

    // --- HTML要素の取得 ---
    const startButton = document.getElementById('start-button');
    const statusDisplay = document.getElementById('status-display');
    const bpmDisplay = document.getElementById('bpm-display');
    const accelX = document.getElementById('accel-x');
    const accelY = document.getElementById('accel-y');
    const accelZ = document.getElementById('accel-z');

    // --- アプリケーションの状態を管理する変数 ---
    let audioContext;
    let lastStepTime = 0;
    let stepTimestamps = [];
    let currentBPM = 0;
    let schedulerId = null;
    let lastStepStrength = 0.5; // 音量の初期値

    // --- イベントリスナー ---
    startButton.addEventListener('click', () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        statusDisplay.textContent = 'センサーへのアクセス許可をリクエスト中...';
        requestSensorPermission();
    });

    // --- 関数 ---

    // センサーへのアクセス許可をリクエスト
    function requestSensorPermission() {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        statusDisplay.textContent = '許可されました。歩き始めてください。';
                        window.addEventListener('devicemotion', handleMotionEvent);
                    } else {
                        statusDisplay.textContent = '許可されませんでした。';
                    }
                })
                .catch(error => {
                    statusDisplay.textContent = 'エラー: ' + error;
                });
        } else {
            statusDisplay.textContent = 'このブラウザでは許可は不要です。歩き始めてください。';
            window.addEventListener('devicemotion', handleMotionEvent);
        }
    }

    // センサーデータが更新されるたびに実行されるメインの処理
    function handleMotionEvent(event) {
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration || acceleration.x === null) return;

        const magnitude = Math.sqrt(
            acceleration.x * acceleration.x +
            acceleration.y * acceleration.y +
            acceleration.z * acceleration.z
        );

        // デバッグ表示の更新
        accelX.textContent = acceleration.x.toFixed(2);
        accelY.textContent = acceleration.y.toFixed(2);
        accelZ.textContent = acceleration.z.toFixed(2);

        // 歩行検知ロジック
        const now = Date.now();
        if (magnitude > STEP_THRESHOLD && now - lastStepTime > STEP_COOLDOWN) {
            lastStepTime = now;
            
            // 歩行の強さを計算して保存 (0.1〜1.0の範囲に収める)
            lastStepStrength = Math.min(Math.max((magnitude - 11.0) / 10.0, 0.1), 1.0);

            // BPMを更新
            updateBPM(now);
        }
    }

    // BPMを計算・更新
    function updateBPM(stepTime) {
        stepTimestamps.push(stepTime);
        if (stepTimestamps.length > BPM_SAMPLES) {
            stepTimestamps.shift();
        }
        if (stepTimestamps.length < 2) return;

        const intervals = [];
        for (let i = 1; i < stepTimestamps.length; i++) {
            intervals.push(stepTimestamps[i] - stepTimestamps[i - 1]);
        }
        const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        
        currentBPM = 60000 / averageInterval;
        bpmDisplay.textContent = currentBPM.toFixed(0);

        // BPMの更新に合わせてスケジューラーを更新
        startOrUpdateScheduler();
    }

    // BPMに合わせて音を鳴らすスケジューラー
    function startOrUpdateScheduler() {
        if (schedulerId) {
            clearInterval(schedulerId);
        }
        if (currentBPM < 40) return;

        const interval = 60000 / currentBPM;
        schedulerId = setInterval(() => {
            playSound(lastStepStrength);
        }, interval);
    }

    // 音を鳴らす
    function playSound(volume) {
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
});
