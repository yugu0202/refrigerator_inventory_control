"use client";

import React, { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeReaderPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = new BrowserMultiFormatReader();
  const [result, setResult] = useState('');

  const startScanner = () => {
    if (!videoRef.current) { return; }

    codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
      if (result) {
        console.log('Barcode result: ', result.getText());
        setResult(result.getText());
      }
      if (error) {
        console.error('Barcode error: ', error);
      }
    });
  };

  const stopScanner = () => {
    codeReader.stop();
  };

  return (
    <div>
      <h1>バーコードリーダー</h1>
      <div>
        <button onClick={startScanner}>スキャン開始</button>
        <button onClick={stopScanner}>スキャン停止</button>
      </div>
      <div style={{ width: '300px', margin: 'auto' }}>
        <video ref={videoRef} />
      </div>
      <h2>スキャン結果: {result}</h2>
    </div>
  );
};

export default BarcodeReaderPage;
