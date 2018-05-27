import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Login from './views/Login.vue'
import AddBook from './views/AddBook.vue'
import EditBook from './views/EditBook.vue'
import Search from './views/Search.vue'

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
    }
  ]
})
