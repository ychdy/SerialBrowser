//TODO:2ポート対応をコピペで済ませてあるので、共通化したい

let serialPort = null;    //シリアルポートのオブジェクト
let serialReader = null;  //シリアプポートからデータを読み込む用オブジェクト
let isConnected = false;

let serialPort2 = null;    //シリアルポートのオブジェクト
let serialReader2 = null;  //シリアプポートからデータを読み込む用オブジェクト
let isConnected2 = false;

// Connectボタンがクリックされたときの処理
const connectButton = document.getElementById('connectButton');
connectButton.addEventListener('click', async() => {
  try {
    serialPort = await navigator.serial.requestPort();
	const baudrateSelect = document.getElementById('baudrateSelect');
    const baudrate = parseInt(baudrateSelect.value, 10);
    await serialPort.open({ baudRate: baudrate });

    const portInfo = await serialPort.getInfo();
    const portName = portInfo.name;
    console.log('Serial port name:', portName);

    isConnected = true;
	updateConnectionStatus(portName);
        
    serialReader = serialPort.readable.getReader();

    readLoop();
    
  } catch (error) {
    console.error('Serial port connection failed:', error);
  }
});

const connectButton2 = document.getElementById('connectButton2');
connectButton2.addEventListener('click', async() => {
  try {
    serialPort2 = await navigator.serial.requestPort();
	const baudrateSelect2 = document.getElementById('baudrateSelect2');
    const baudrate2 = parseInt(baudrateSelect2.value, 10);
    await serialPort2.open({ baudRate: baudrate2 });

    const portInfo2 = await serialPort2.getInfo();
    const portName2 = portInfo2.name;
    console.log('Serial port 2 name:', portName2);

    isConnected2 = true;
	updateConnectionStatus2(portName2);
        
    serialReader2 = serialPort2.readable.getReader();

    readLoop2();
    
  } catch (error) {
    console.error('Serial port 2 connection failed:', error);
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

async function readLoop2() {
    while (true) {
        const { value, done } = await serialReader2.read();
        if (done) break;
        console.log('return:',value);
        const resultTextarea2 = document.getElementById('resultTextarea2');
        const resultText2 = new TextDecoder().decode(value);

        // 改行コードを変換してテキストボックスに追記
        resultTextarea2.value += resultText2.replace(/\r\n/g, '\n');
        
        // テキストボックスを最下部にスクロール
        resultTextarea2.scrollTop = resultTextarea2.scrollHeight;
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

const disconnectButton2 = document.getElementById('disconnectButton2');
disconnectButton2.addEventListener('click', async () => {
  try {
    if (!serialPort2) {
      console.error('Serial port 2 is not connected');
      return;
    }

    // 切断前に読み取りループを停止する必要がある
    await serialReader2.cancel();
    
    // シリアルポートを切断
    await serialPort2.close();
	isConnected2 = false;
	updateConnectionStatus();
	
  } catch (error) {
    console.error('Failed to disconnect serial port 2:', error);
  }
});

// Clearボタン:テキストエリアの中身を空にする
const clearButton = document.getElementById('clearButton');
const textInput = document.getElementById('resultTextarea');

clearButton.addEventListener('click', () => {
  textInput.value = '';
});

const clearButton2 = document.getElementById('clearButton2');
const textInput2 = document.getElementById('resultTextarea2');

clearButton2.addEventListener('click', () => {
  textInput2.value = '';
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

function handleKeyPress2(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // デフォルトのEnterキーの動作をキャンセルする
  
      const commandInput2 = document.getElementById('commandInput2');
      sendCommand2(commandInput2.value);
  
      // テキストボックスをクリアする
      commandInput2.value = ''; 
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

const sendCommand2 = async (command) => {
    console.log('送信するコマンド:', command);
    console.log('送信するコマンド(エンコード後):', new TextEncoder().encode(command));
  
    try {
      if (!serialPort2) {
        console.error('Serial port 2 is not connected');
        return;
      }
  
      // コマンドをシリアルポートに送信
      const writer = serialPort2.writable.getWriter();
      await writer.write(new TextEncoder().encode(command + '\r'));
      writer.releaseLock();
  
    } catch (error) {
      console.error('Failed to send command 2:', error);
    }
  };

// 接続状態の更新
function updateConnectionStatus(portName) {
  if (isConnected) {
    connectionStatus.textContent = '接続済 (' + portName + ')';
  } else {
    connectionStatus.textContent = '未接続';
  }
}

function updateConnectionStatus2(portName2) {  
    if (isConnected2) {
      connectionStatus2.textContent = '接続済 (' + portName2 + ')';
    } else {
      connectionStatus2.textContent = '未接続';
    }
  }

// HTMLファイルのロード完了時(最初の画面表示時)に接続状態を更新
document.addEventListener('DOMContentLoaded', () => {
  updateConnectionStatus();
  updateConnectionStatus2();
});

function SerialTest() {
    if (isConnected) {
        const commandInput = document.getElementById('commandInput');
        sendCommand(commandInput.value);
    }
}
