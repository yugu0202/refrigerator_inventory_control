"use client";

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useRouter } from 'next/navigation';

const BarcodeReaderPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = new BrowserMultiFormatReader();
  const router = useRouter();

  const [resultText, setResultText] = useState('商品情報が見つかりませんでした');
  const [devices, setDevices] = useState<React.JSX.Element[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined >(undefined);

  const startScanner = () => {
    if (!videoRef.current) { return; }

    console.log(selectedDevice);

    codeReader.decodeFromVideoDevice(selectedDevice, videoRef.current, (code_result, error) => {
      if (code_result) {
        fetch(`/api/jancode?code=${code_result.getText()}`).then((response) => response.json()).then((data) => {
          setResultText(data.result);
          router.push(`/barcode/${code_result.getText()}`);
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
      <h2>スキャン結果: {resultText}</h2>
    </div>
  );
};

export default BarcodeReaderPage;
