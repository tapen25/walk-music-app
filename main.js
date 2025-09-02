// ページの読み込みが完了したら実行する
window.addEventListener('DOMContentLoaded', () => {

    // HTMLから必要な要素を取得
    const startButton = document.getElementById('start-button');
    const statusDisplay = document.getElementById('status-display');

    // 加速度センサーの表示用
    const accelX = document.getElementById('accel-x');
    const accelY = document.getElementById('accel-y');
    const accelZ = document.getElementById('accel-z');

    // 傾きセンサーの表示用
    const orientA = document.getElementById('orient-a');
    const orientB = document.getElementById('orient-b');
    const orientG = document.getElementById('orient-g');

    // 「センサーを開始」ボタンがクリックされた時の処理
    startButton.addEventListener('click', () => {
        statusDisplay.textContent = 'センサーへのアクセス許可をリクエスト中...';
        
        // センサーへのアクセス許可を求める関数を呼び出す
        requestSensorPermission();
    });

    // iOS 13以降向けのセンサー許可をリクエストする関数
    function requestSensorPermission() {
        // DeviceMotionEventが存在し、その中にrequestPermission関数があるかチェック (iOS 13+のSafariの証拠)
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        // 許可された場合
                        statusDisplay.textContent = '許可されました。デバイスを動かしてみてください。';
                        // イベントリスナーをセット
                        window.addEventListener('devicemotion', handleMotionEvent);
                        window.addEventListener('deviceorientation', handleOrientationEvent);
                    } else {
                        // 許可されなかった場合
                        statusDisplay.textContent = '許可されませんでした。';
                    }
                })
                .catch(error => {
                    // 何らかのエラーが発生した場合
                    statusDisplay.textContent = 'エラーが発生しました: ' + error;
                    console.error(error);
                });

        } else {
            // PCのChromeやAndroidなど、許可が不要なブラウザの場合
            statusDisplay.textContent = 'このブラウザでは許可は不要です。デバイスを動かしてみてください。';
            window.addEventListener('devicemotion', handleMotionEvent);
            window.addEventListener('deviceorientation', handleOrientationEvent);
        }
    }

    // 加速度センサーの値が変化した時に呼ばれる関数
    function handleMotionEvent(event) {
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration && acceleration.x !== null) {
            accelX.textContent = acceleration.x.toFixed(2);
            accelY.textContent = acceleration.y.toFixed(2);
            accelZ.textContent = acceleration.z.toFixed(2);
        }
    }

    // 傾きセンサーの値が変化した時に呼ばれる関数
    function handleOrientationEvent(event) {
        if (event.alpha !== null) {
            orientA.textContent = event.alpha.toFixed(2);
            orientB.textContent = event.beta.toFixed(2);
            orientG.textContent = event.gamma.toFixed(2);
        }
    }

});
