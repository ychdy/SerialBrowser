let serialPort = null;    //シリアルポートのオブジェクト
let serialReader = null;  //シリアプポートからデータを読み込む用オブジェクト
let isConnected = false;

// Connectボタンがクリックされたときの処理
const connectButton = document.getElementById('connectButton');
connectButton.addEventListener('click', async() => {
  try {
    serialPort = await navigator.serial.requestPort();
	const baudrateSelect = document.getElementById('baudrateSelect');
    const baudrate = parseInt(baudrateSelect.value, 10);
    await serialPort.open({ baudRate: baudrate });

    isConnected = true;
	updateConnectionStatus();
        
    serialReader = serialPort.readable.getReader();

    readLoop();
    
  } catch (error) {
    console.error('Serial port connection failed:', error);
  }
});

// データ受信のループ処理
async function readLoop() {
    while (true) {
        const { value, done } = await serialReader.read();
        if (done) break;
        console.log('return:',value);
        const resultTextarea = document.getElementById('resultTextarea');
        const resultText = new TextDecoder().decode(value);

        // 改行コードを変換してテキストボックスに追記
        resultTextarea.value += resultText.replace(/\r\n/g, '\n');
        
        // テキストボックスを最下部にスクロール
        resultTextarea.scrollTop = resultTextarea.scrollHeight;
    }
}

// Disconnectボタンがクリックされたときの処理
const disconnectButton = document.getElementById('disconnectButton');
disconnectButton.addEventListener('click', async () => {
  try {
    if (!serialPort) {
      console.error('Serial port is not connected');
      return;
    }

    // 切断前に読み取りループを停止する必要がある
    await serialReader.cancel();
    
    // シリアルポートを切断
    await serialPort.close();
	isConnected = false;
	updateConnectionStatus();
	
  } catch (error) {
    console.error('Failed to disconnect serial port:', error);
  }
});

// Clearボタン:テキストエリアの中身を空にする
const clearButton = document.getElementById('clearButton');
const textInput = document.getElementById('resultTextarea');

clearButton.addEventListener('click', () => {
  textInput.value = '';
});

// コマンド入力中のEnterキー受付
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // デフォルトのEnterキーの動作をキャンセルする

    const commandInput = document.getElementById('commandInput');
    sendCommand(commandInput.value);

    // テキストボックスをクリアする
    commandInput.value = ''; 
  }
}

// コマンド送信処理
const sendCommand = async (command) => {
  console.log('送信するコマンド:', command);
  console.log('送信するコマンド(エンコード後):', new TextEncoder().encode(command));

  try {
    if (!serialPort) {
      console.error('Serial port is not connected');
      return;
    }

    // コマンドをシリアルポートに送信
    const writer = serialPort.writable.getWriter();
    await writer.write(new TextEncoder().encode(command + '\r'));
    writer.releaseLock();

  } catch (error) {
    console.error('Failed to send command:', error);
  }
};

// 接続状態の更新
function updateConnectionStatus() {
  if (isConnected) {
    connectionStatus.textContent = '接続済'
  } else {
    connectionStatus.textContent = '未接続';
  }
}

// HTMLファイルのロード完了時(最初の画面表示時)に接続状態を更新
document.addEventListener('DOMContentLoaded', () => {
  updateConnectionStatus();
});

function SerialTest() {
    if (isConnected) {
        const commandInput = document.getElementById('commandInput');
        sendCommand(commandInput.value);
    }
}