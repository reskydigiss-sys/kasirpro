export type PrinterConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'searching' | 'error';

export type PrinterInterfaceType = 'bluetooth' | 'usb' | 'serial' | 'network' | 'system';

export type PaperWidth = '58mm' | '80mm';

export interface PrinterDevice {
  id: string;
  name: string;
  type: PrinterInterfaceType;
  status: PrinterConnectionStatus;
  paperWidth: PaperWidth;
  vendorId?: string;
  productId?: string;
  batteryLevel?: number; // e.g. 85 for 85%
  signalStrength?: number; // e.g. -55 dBm or 1-100 percentage
  macAddress?: string;
  lastConnected?: string;
  autoReconnect: boolean;
  isDefault: boolean;
  isSimulated?: boolean;
}

export interface PrinterSettings {
  autoDetectOnStartup: boolean;
  autoPrintOnCheckout: boolean;
  paperWidth: PaperWidth;
  feedLines: number;
  cutPaper: boolean;
  soundAlerts: boolean;
  characterSet: string;
  headerStoreName?: string;
  footerMessage?: string;
}

export interface HardwareSupport {
  bluetooth: boolean;
  usb: boolean;
  serial: boolean;
  browserPrint: boolean;
}

export interface PrinterNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
}
