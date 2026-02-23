import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ibac.connect',
  appName: 'IBAC',
  webDir: 'out',
  server: {
    url: 'https://ibac-connect.vercel.app/',
    cleartext: true
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000, 
      launchAutoHide: true,
      backgroundColor: "#FF6B00",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;