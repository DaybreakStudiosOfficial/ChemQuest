import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyC7BwXsHv85dihR-w-frd6p2whxF3QnIQg",
    authDomain: "chem-quest-8eeac.firebaseapp.com",
    databaseURL: "https://chem-quest-8eeac-default-rtdb.firebaseio.com",
    projectId: "chem-quest-8eeac",
    storageBucket: "chem-quest-8eeac.appspot.com",
    messagingSenderId: "611574866328",
    appId: "1:611574866328:web:b781f1deba49225ce64bed",
    measurementId: "G-3SD23GEQC5"
}
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export var database = getFirestore(app)
export var storage = getStorage(app)
export var auth = getAuth(app)