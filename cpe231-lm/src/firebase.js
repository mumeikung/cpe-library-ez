import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

const config = {
  apiKey: 'AIzaSyBCb7LN69EliXJcAcrEk5Dwrnsy43bhp20',
  authDomain: 'cpe231-library-management.firebaseapp.com',
  databaseURL: 'https://cpe231-library-management.firebaseio.com',
  projectId: 'cpe231-library-management',
  storageBucket: 'cpe231-library-management.appspot.com',
  messagingSenderId: '850099037480'
}

firebase.initializeApp(config)

firebase.firestore().settings({
  timestampsInSnapshots: true
})

export default firebase
