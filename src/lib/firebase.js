import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
let app;
if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
} else if (typeof window !== 'undefined') {
  app = getApps()[0];
}

// Get FCM token
export const getFCMToken = async () => {
  try {
    if (typeof window === 'undefined') return null;
    
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Messaging is not supported in this browser');
      return null;
    }

    const messaging = getMessaging(app);
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get token
    const token = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey
    });

    if (token) {
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    isSupported().then((supported) => {
      if (!supported) {
        resolve(null);
        return;
      }

      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }).catch(() => {
      resolve(null);
    });
  });
};

export default app;

