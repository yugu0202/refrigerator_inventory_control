"use client";

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  ChakraProvider,
  useToast,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useDisclosure,
} from '@chakra-ui/react';


function Scanedrawer() {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const [items, setItems] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    if (!isOpen) { return; }

    let items: React.JSX.Element[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key === null) { continue; }
      const value = sessionStorage.getItem(key);
      console.log(key, value);
      items.push(<p key={key}>{value}</p>);
    }

    setItems(items);
  }, [isOpen]);

  return (
    <>
      <Button colorScheme='blue' onClick={onOpen} className="w-full lg:w-1/2">
        &and;
      </Button>
      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>読み取り済み商品一覧</DrawerHeader>
          <DrawerBody>
            {items}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = new BrowserMultiFormatReader();
  const toast = useToast();

  const [devices, setDevices] = useState<React.JSX.Element[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined >(undefined);

  const startScanner = () => {
    if (!videoRef.current) { return; }

    codeReader.decodeFromVideoDevice(selectedDevice, videoRef.current, (code_result, error) => {
      if (code_result) {
        console.log(sessionStorage.getItem(code_result.getText()));
        if (sessionStorage.getItem(code_result.getText()) != null) { return; }


        fetch(`/api/jancode?code=${code_result.getText()}`)
        .then((response) => {
          if (response.status === 400) {
            return null
          }

          return response.json()
        })
        .then((data) => {
          if (!data) { return; }

          let status = "info" as "info" | "error" | "warning" | "success" | "loading" | undefined;

          console.log(data);

          // ここは後々ユーザーに入力させるようにする
          if (data.name === "商品が見つかりませんでした") {
            status = "error";
          }

          toast({
            title: '読み取り結果',
            description: data.name,
            status: status,
            position: 'top',
            duration: 6000,
            isClosable: true,
          });

          sessionStorage.setItem(code_result.getText(), data.name);
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
  }, []);

  return (
    <ChakraProvider>
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
      <Scanedrawer />
    </ChakraProvider>
  );
};
