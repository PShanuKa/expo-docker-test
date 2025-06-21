import { useEffect, useState } from "react";
import * as Device from "expo-device";

// Custom hook to check if the device is a Honeywell device
export const useDeviceCheck = () => {
  const [isHoneywellDevice, setIsHoneywellDevice] = useState(false);

  useEffect(() => {
    const checkDevice = async () => {
      try {
        const modelName = await Device.modelName;
     
        const honeywellDevices = ["CT60", "CN80", "EDA51", "CK65"];
        setIsHoneywellDevice(honeywellDevices.includes(modelName));
      } catch (error) {
        console.error("Error checking device model:", error);
        setIsHoneywellDevice(false); 
      }
    };

    checkDevice();
  }, []);

  return isHoneywellDevice;
};