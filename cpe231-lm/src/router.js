import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Login from './views/Login.vue'
import AddBook from './views/AddBook.vue'
import EditBook from './views/EditBook.vue'
import Search from './views/Search.vue'
import Borrow from './views/Borrow.vue'
import Return from './views/Return.vue'
import AddMember from './views/AddMember.vue'
import EditMember from './views/EditMember.vue'
import AddStaff from './views/AddStaff.vue'
import Info from './views/Info.vue'
import Check from './views/Check.vue'
import Analysis from './views/Analysis.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    },
    {
      path: '/addbook',
      name: 'AddBook',
      component: AddBook
    },
    {
      path: '/editbook',
      name: 'EditBook',
      component: EditBook,
      props: true
    },
    {
      path: '/borrow',
      name: 'Borrow',
      component: Borrow
    },
    {
      path: '/return',
      name: 'Return',
      component: Return
    },
    {
      path: '/editmember',
      name: 'EditMember',
      component: EditMember
    },
    {
      path: '/addmember',
      name: 'AddMember',
      component: AddMember
    },
    {
      path: '/addstaff',
      name: 'AddStaff',
      component: AddStaff
    },
    {
      path: '/info',
      name: 'Info',
      component: Info
    },
    {
      path: '/check',
      name: 'Check',
      component: Check
    },
    {
      path: '/analysis',
      name: 'Analysis',
      component: Analysis
    }
  ]
})
