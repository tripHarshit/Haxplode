// services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


// Validate required env vars early for clearer errors
const requiredFirebaseEnvKeys = [
	'VITE_FIREBASE_API_KEY',
	'VITE_FIREBASE_AUTH_DOMAIN',
	'VITE_FIREBASE_PROJECT_ID',
	'VITE_FIREBASE_APP_ID',
];
const missingFirebaseEnvKeys = requiredFirebaseEnvKeys.filter(
	(key) => {
		const value = import.meta.env[key];
		return !value || String(value).trim() === '';
	}
);
export const isFirebaseConfigured = missingFirebaseEnvKeys.length === 0;
if (!isFirebaseConfigured) {
	// eslint-disable-next-line no-console
	console.error(
		`Missing Firebase env vars: ${missingFirebaseEnvKeys.join(', ')}. Ensure these are set in your .env and restart the dev server.`
	);
}

// Initialize Firebase (guarded for HMR)
let app;
let auth = null;
let googleProvider = null;
if (isFirebaseConfigured) {
	if (!globalThis._firebaseApp) {
		app = initializeApp(firebaseConfig);
		globalThis._firebaseApp = app;
	} else {
		app = globalThis._firebaseApp;
	}

	auth = getAuth(app);
	googleProvider = new GoogleAuthProvider();
	// Request OpenID scopes to ensure idToken is returned
	if (googleProvider) {
		googleProvider.addScope('openid');
		googleProvider.addScope('email');
		googleProvider.addScope('profile');
	}
}

export { auth, googleProvider };

