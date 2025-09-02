// 加速度の表示要素
const accelX = document.getElementById('accel-x');
const accelY = document.getElementById('accel-y');
const accelZ = document.getElementById('accel-z');

// 【追加】傾きの表示要素
const orientA = document.getElementById('orient-a');
const orientB = document.getElementById('orient-b');
const orientG = document.getElementById('orient-g');

// 1. 加速度センサーのイベントリスナー
window.addEventListener('devicemotion', (event) => {
    console.log('Device Motion Event Fired!'); // 加速度イベントが発生したらログが出る
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && acceleration.x !== null) {
        accelX.textContent = acceleration.x.toFixed(2);
        accelY.textContent = acceleration.y.toFixed(2);
        accelZ.textContent = acceleration.z.toFixed(2);
    }
});

// 2. 【追加】傾きセンサーのイベントリスナー
window.addEventListener('deviceorientation', (event) => {
    console.log('Device Orientation Event Fired!'); // 傾きイベントが発生したらログが出る
    orientA.textContent = event.alpha.toFixed(2);
    orientB.textContent = event.beta.toFixed(2);
    orientG.textContent = event.gamma.toFixed(2);
});

console.log('JavaScript is loaded and running!');
