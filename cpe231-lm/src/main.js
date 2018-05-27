import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Vuex from 'vuex'
import 'es6-promise/auto'
import firebase from '@/firebase'

Vue.use(Vuex)
Vue.use(BootstrapVue)
Vue.config.productionTip = false

const LOGIN = 'LOGIN'
const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
const LOGOUT = 'LOGOUT'
const DATA_UPDATE = 'DATA_UPDATE'
const store = new Vuex.Store({
  state: {
    isLoggedIn: !!localStorage.getItem('uid'),
    uid: null,
    email: null,
    displayName: null,
    type: null,
    userData: null
  },
  mutations: {
    [LOGIN] (state) {
      state.pending = true
      state.uid = null
      state.email = null
      state.displayName = null
      state.type = null
      state.userData = null
    },
    [LOGIN_SUCCESS] (state, user) {
      state.isLoggedIn = true
      state.pending = false
      state.uid = user.uid
      state.email = user.email
      state.displayName = user.displayName
      state.userData = null
    },
    [LOGOUT] (state) {
      state.isLoggedIn = false
      state.uid = null
      state.email = null
      state.displayName = null
      state.type = null
      state.userData = null
    },
    [DATA_UPDATE] (state, data) {
      state.type = data.type
      state.displayName = data.Name + ' ' + data.Surname
      state.userData = data
    }
  },
  actions: {
    login ({ commit }, creds) {
      commit(LOGIN)
      return firebase.auth().signInWithEmailAndPassword(creds.email, creds.password)
    },
    logout ({ commit }) {
      return firebase.auth().signOut()
    },
    loginSuccess ({ commit }, creds) {
      commit(LOGIN_SUCCESS, creds)
    },
    logoutSuccess ({ commit }) {
      commit(LOGOUT)
    },
    sendUserData ({ commit }, creds) {
      commit(DATA_UPDATE, creds)
    }
  },
  getters: {
    isLoggedIn: state => {
      return state.isLoggedIn
    },
    uid: state => {
      return state.uid
    },
    displayName: state => {
      return state.displayName
    },
    email: state => {
      return state.email
    },
    userData: state => {
      return state.userData
    },
    isStaff: state => {
      return state.type === 'staff'
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

let rtdb = function () {}
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    rtdb()
    store.dispatch('loginSuccess', user)
    rtdb = firebase.firestore().collection('users').doc(user.uid).onSnapshot(function (doc) {
      if (doc.exists) {
        store.dispatch('sendUserData', doc.data())
      } else {
        store.dispatch('logoutSuccess')
      }
    }, function (error) {
      console.error(error)
      rtdb = function () {}
      store.dispatch('logoutSuccess')
    })
  } else {
    // User is signed out.
    rtdb()
    rtdb = function () {}
    store.dispatch('logoutSuccess')
    router.push('/')
  }
})
