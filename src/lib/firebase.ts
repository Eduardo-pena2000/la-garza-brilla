import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDi0AQO49GJhwIHY9IZHY-OKi-vgxOe6QQ",
  authDomain: "loteria-la-garza-ed90b.firebaseapp.com",
  databaseURL: "https://loteria-la-garza-ed90b-default-rtdb.firebaseio.com",
  projectId: "loteria-la-garza-ed90b",
  storageBucket: "loteria-la-garza-ed90b.firebasestorage.app",
  messagingSenderId: "233458148701",
  appId: "1:233458148701:web:c7358ec477e146861074b4",
  measurementId: "G-0DXNXHJ4NF"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
