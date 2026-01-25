import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.etchat.app',
  appName: 'eT chat',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    Permissions: {},
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
