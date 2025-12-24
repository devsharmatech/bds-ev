// Script to generate service worker with Firebase config
// Run: node scripts/generate-service-worker.js

const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID'
};

const serviceWorkerContent = `// Service Worker for Firebase Cloud Messaging
// Auto-generated - DO NOT EDIT MANUALLY
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'BDS Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.tag || 'bds-notification',
    data: payload.data || {},
    requireInteraction: false,
    silent: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();

  // Handle click action
  const clickAction = event.notification.data?.click_action || '/';
  const urlToOpen = clickAction.startsWith('http') 
    ? clickAction 
    : self.location.origin + clickAction;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
`;

const publicDir = path.join(process.cwd(), 'public');
const swPath = path.join(publicDir, 'firebase-messaging-sw.js');

fs.writeFileSync(swPath, serviceWorkerContent);
console.log('Service worker generated successfully at:', swPath);

