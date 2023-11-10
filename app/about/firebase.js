import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBWaUTh4SuTUe6UOES8DAmp8Kv4BmZ_otg',
  authDomain: 'teste-edc9c.firebaseapp.com',
  projectId: 'teste-edc9c',
  storageBucket: 'teste-edc9c.appspot.com',
  messagingSenderId: '1017503897558',
  appId: '1:1017503897558:web:e0f3f5a98bca95e0383677',
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
