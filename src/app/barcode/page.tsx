"use client";

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { ChakraProvider, useToast } from '@chakra-ui/react';

const BarcodeReaderPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = new BrowserMultiFormatReader();
  const toast = useToast();

  const [devices, setDevices] = useState<React.JSX.Element[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined >(undefined);

  const startScanner = () => {
    if (!videoRef.current) { return; }

    console.log(selectedDevice);

    codeReader.decodeFromVideoDevice(selectedDevice, videoRef.current, (code_result, error) => {
      if (code_result) {
        fetch(`/api/jancode?code=${code_result.getText()}`).then((response) => response.json()).then((data) => {
          console.log(data);
          toast({
            title: '読み取り結果',
            description: data.name,
            status: 'info',
            position: 'top',
            duration: 9000,
            isClosable: true,
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
    <ChakraProvider>
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
      </div>
    </ChakraProvider>
  );
};

export default BarcodeReaderPage;
