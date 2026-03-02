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
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      iconColor: '#E2725B',
      channels: [
        {
          id: 'calls',
          name: 'Call alerts',
          importance: 5,
        },
      ],
    },
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
