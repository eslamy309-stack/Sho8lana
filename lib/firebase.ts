// Firebase integration — works with env vars. Falls back gracefully to localStorage when not configured.
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  type User,
} from 'firebase/auth'
import {
  getFirestore, doc, setDoc, getDoc, collection,
  addDoc, getDocs, query, where, orderBy, limit,
  serverTimestamp, updateDoc, type Firestore,
} from 'firebase/firestore'
import {
  getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage,
} from 'firebase/storage'

// ── Config ─────────────────────────────────────────────────────────────────
// Replace these with your actual Firebase project values from:
// console.firebase.google.com → Project Settings → Your apps → Web app
const FIREBASE_CONFIG = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? '',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '',
}

export const isFirebaseConfigured = () => Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId)

let app: FirebaseApp | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

function initFirebase() {
  if (!isFirebaseConfigured()) return
  if (getApps().length === 0) {
    app = initializeApp(FIREBASE_CONFIG)
  } else {
    app = getApps()[0]
  }
  db = getFirestore(app)
  storage = getStorage(app)
}

if (typeof window !== 'undefined') initFirebase()

// ── Auth helpers ────────────────────────────────────────────────────────────
export function getFirebaseAuth() {
  if (!app) return null
  return getAuth(app)
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not configured')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function registerWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not configured')
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not configured')
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export async function logout() {
  const auth = getFirebaseAuth()
  if (!auth) return
  return signOut(auth)
}

export function onAuthChange(cb: (user: User | null) => void) {
  const auth = getFirebaseAuth()
  if (!auth) { cb(null); return () => {} }
  return onAuthStateChanged(auth, cb)
}

// ── User profile ────────────────────────────────────────────────────────────
export async function saveUserProfile(uid: string, data: Record<string, unknown>) {
  if (!db) return saveToLocal(`profile_${uid}`, data)
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getUserProfile(uid: string) {
  if (!db) return loadFromLocal(`profile_${uid}`)
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ── Applications ────────────────────────────────────────────────────────────
export async function saveApplication(uid: string, app: Record<string, unknown>) {
  if (!db) {
    const existing = loadFromLocal<unknown[]>(`apps_${uid}`) ?? []
    existing.push(app)
    saveToLocal(`apps_${uid}`, existing)
    return
  }
  const col = collection(db, 'applications')
  await addDoc(col, { ...app, uid, createdAt: serverTimestamp() })
}

export async function getUserApplications(uid: string) {
  if (!db) return loadFromLocal<unknown[]>(`apps_${uid}`) ?? []
  const q = query(collection(db, 'applications'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── File uploads ────────────────────────────────────────────────────────────
export async function uploadDocument(uid: string, file: File, docKey: string): Promise<string> {
  if (!storage) {
    // Fallback: store file name only
    return `local://${file.name}`
  }
  const path = `users/${uid}/documents/${docKey}_${Date.now()}_${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

// ── Company Portal ──────────────────────────────────────────────────────────
export async function saveJobPosting(data: Record<string, unknown>) {
  if (!db) {
    const existing = loadFromLocal<unknown[]>('company_jobs') ?? []
    existing.push({ ...data, id: Date.now().toString() })
    saveToLocal('company_jobs', existing)
    return
  }
  await addDoc(collection(db, 'job_postings'), { ...data, createdAt: serverTimestamp() })
}

export async function getCompanyJobs(companyId: string) {
  if (!db) return loadFromLocal<unknown[]>('company_jobs') ?? []
  const q = query(
    collection(db, 'job_postings'),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getJobApplicants(jobId: string) {
  if (!db) return []
  const q = query(collection(db, 'applications'), where('jobId', '==', jobId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateApplicantStatus(appId: string, status: string) {
  if (!db) return
  await updateDoc(doc(db, 'applications', appId), { status })
}

// ── Local storage helpers (fallback) ───────────────────────────────────────
function saveToLocal(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

function loadFromLocal<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : null
  } catch { return null }
}
