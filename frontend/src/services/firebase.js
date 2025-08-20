import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (guarded for HMR)
let app;
if (!globalThis._firebaseApp) {
	app = initializeApp(firebaseConfig);
	globalThis._firebaseApp = app;
} else {
	app = globalThis._firebaseApp;
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Request OpenID scopes to ensure idToken is returned
googleProvider.addScope('openid');
googleProvider.addScope('email');
googleProvider.addScope('profile'); 