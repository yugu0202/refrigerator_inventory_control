"use client";

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeReaderPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = new BrowserMultiFormatReader();
  const parser = new DOMParser();
  const [result, setResult] = useState('');
  const [devices, setDevices] = useState<React.JSX.Element[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined >(undefined);

  const startScanner = () => {
    if (!videoRef.current) { return; }

    console.log(selectedDevice);

    codeReader.decodeFromVideoDevice(selectedDevice, videoRef.current, (code_result, error) => {
      if (code_result && code_result.getText() != result) {
        console.log('Barcode result: ', code_result.getText());

        fetch(`https://jancode.xyz/code/?q=${code_result.getText()}`).then((response) => {
          response.text().then((text) => {
            const doc = parser.parseFromString(text, 'text/html');
            const result = doc.querySelector('p.description')?.textContent;
            setResult(result || '商品情報が見つかりませんでした');
          });
        });
        
      }
    });
  };

  const stopScanner = () => {
  };

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value);
    setSelectedDevice(event.target.value);
  }

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices = devices.filter((device) => device.kind === 'videoinput');
      const deviceOptions = devices.map((device) => {
        return(
          <option value={device.deviceId} key={device.label}>{device.label}</option>
        );
      });
      setDevices(deviceOptions);
    });
  });

  return (
    <div>
      <h1>バーコードリーダー</h1>
      <div>
        <button onClick={startScanner}>スキャン開始</button>
        <button onClick={stopScanner}>スキャン停止</button>
        <select onChange={handleDeviceChange}>
          {devices}
        </select>
      </div>
      <div style={{ width: '300px', margin: 'auto' }}>
        <video ref={videoRef} />
      </div>
      <h2>スキャン結果: {result}</h2>
    </div>
  );
};

export default BarcodeReaderPage;
