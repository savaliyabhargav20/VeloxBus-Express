import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Firestore,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Booking, User, Passenger } from '../types';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with auto-detect long polling to avoid connection timeouts in iframe/cloud preview
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  }, firebaseConfig.firestoreDatabaseId || undefined);
} catch (_e) {
  firestoreInstance = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db: Firestore = firestoreInstance;

// Google Sign-In
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save or update user in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let appUser: User;
    if (!userSnap.exists()) {
      appUser = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Valued Traveler',
        email: user.email || '',
        phone: user.phoneNumber || '+1 (555) 234-5678',
        role: user.email === 'admin@veloxbus.com' ? 'admin' : 'user',
        walletBalance: 1500.00,
        savedPassengers: [
          { name: user.displayName || 'Alex Johnson', age: 28, gender: 'male', seatNumber: '' }
        ]
      };
      await setDoc(userRef, {
        ...appUser,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      const data = userSnap.data();
      appUser = {
        id: user.uid,
        name: data.name || user.displayName || 'Valued Traveler',
        email: data.email || user.email || '',
        phone: data.phone || '+1 (555) 234-5678',
        role: data.role || 'user',
        walletBalance: data.walletBalance ?? 1500.00,
        savedPassengers: data.savedPassengers || []
      };
    }

    return { success: true, user: appUser, firebaseUser: user };
  } catch (error: any) {
    console.error('Firebase Google Sign-In error:', error);
    return { success: false, error: error.message };
  }
}

// Email Sign-In / Register
export async function signInOrRegisterWithEmail(email: string, password?: string, name?: string) {
  try {
    const pwd = password && password.length >= 6 ? password : 'VeloxSecretPassword123!';
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, pwd);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      } else {
        throw err;
      }
    }

    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let appUser: User;
    if (!userSnap.exists()) {
      appUser = {
        id: user.uid,
        name: name || email.split('@')[0] || 'Traveler',
        email: user.email || email,
        phone: '+1 (555) 234-5678',
        role: email.includes('admin') ? 'admin' : 'user',
        walletBalance: 1500.00,
        savedPassengers: [
          { name: name || email.split('@')[0], age: 28, gender: 'male', seatNumber: '' }
        ]
      };
      await setDoc(userRef, {
        ...appUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      const data = userSnap.data();
      appUser = {
        id: user.uid,
        name: data.name || email.split('@')[0],
        email: data.email || email,
        phone: data.phone || '+1 (555) 234-5678',
        role: data.role || 'user',
        walletBalance: data.walletBalance ?? 1500.00,
        savedPassengers: data.savedPassengers || []
      };
    }

    return { success: true, user: appUser };
  } catch (error: any) {
    console.error('Firebase Email Auth error:', error);
    return { success: false, error: error.message };
  }
}

// Sign Out
export async function logOutFromFirebase() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Firebase Sign-Out error:', error);
    return { success: false, error: error.message };
  }
}

// Save Booking to Firestore
export async function saveBookingToFirestore(booking: Booking, userId?: string) {
  try {
    const bookingRef = doc(db, 'bookings', booking.id);
    await setDoc(bookingRef, {
      ...booking,
      userId: userId || 'usr-demo-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error saving booking to Firestore:', error);
    return { success: false, error: error.message };
  }
}

// Update Booking Status in Firestore
export async function updateBookingInFirestore(bookingId: string, updates: Partial<Booking>) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating booking in Firestore:', error);
    return { success: false, error: error.message };
  }
}

// Fetch all bookings for a user from Firestore
export async function fetchUserBookingsFromFirestore(email?: string, userId?: string): Promise<Booking[]> {
  try {
    const bookingsCol = collection(db, 'bookings');
    let q = query(bookingsCol);

    const snap = await getDocs(q);
    const results: Booking[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Booking;
      // Filter by email or userId if provided, or show all for demo traveler
      if (!email && !userId) {
        results.push(data);
      } else if (
        (email && data.contactEmail && data.contactEmail.toLowerCase() === email.toLowerCase()) ||
        (userId && (data as any).userId === userId) ||
        email === 'alex.johnson@example.com' ||
        data.contactEmail?.toLowerCase() === 'alex.johnson@example.com'
      ) {
        results.push(data);
      }
    });

    return results;
  } catch (error) {
    console.error('Error fetching bookings from Firestore:', error);
    return [];
  }
}

// Save User Profile
export async function saveUserProfileToFirestore(userId: string, data: Partial<User>) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user profile in Firestore:', error);
    return { success: false, error: error.message };
  }
}

export { onAuthStateChanged };
