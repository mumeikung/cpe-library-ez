<template>
  <div id="app">
    <nav class="navbar navbar-expand-md navbar-light" style="background-color: #c4c4c4">
      <b-container>
        <a class="pointer" @click="$router.push('/')"><img width="120" height="120" src="@/assets/LBEZ.png"></a>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link pointer" @click="$router.push('/')">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link pointer" @click="$router.push('/about')">About</a>
          </li>
          <li class="nav-item dropdown">
            <b-nav-item-dropdown id="nav7_ddown" text="Service" extra-toggle-classes="nav-link-custom" right>
              <b-dropdown-item @click="$router.push('/search')">Search Book</b-dropdown-item>
              <b-dropdown-divider v-if="isStaff"/>
              <b-dropdown-item v-if="isStaff" @click="$router.push('/borrow')">Borrow</b-dropdown-item>
              <b-dropdown-item v-if="isStaff" @click="$router.push('/return')">Return</b-dropdown-item>
              <b-dropdown-divider v-if="isStaff"/>
              <b-dropdown-item v-if="isStaff" @click="$router.push('/addmember')">Add Member</b-dropdown-item>
              <b-dropdown-item v-if="isStaff" @click="$router.push('/editmember')">Edit Member</b-dropdown-item>
              <b-dropdown-divider v-if="isStaff"/>
              <b-dropdown-item v-if="isStaff" @click="$router.push('/addstaff')">Add Staff</b-dropdown-item>
              <b-dropdown-divider v-if="isStaff"/>
              <b-dropdown-item v-if="isStaff" @click="$router.push('/check')">Check</b-dropdown-item>
              <b-dropdown-divider v-if="isStaff"/>
              <b-dropdown-item v-if="isStaff" @click="$router.push('/analysis')">Analysis</b-dropdown-item>
            </b-nav-item-dropdown>
          </li>
          <li class="nav-item">
            <a class="nav-link">|</a>
          </li>
          <li class="nav-item">
            <a class="nav-link pointer" @click="$router.push('/info')" v-if="isLoggedIn">{{displayName === null ? 'Guest' : displayName}}</a>
            <a class="nav-link disabled" v-else>Guest</a>
          </li>
          <li class="nav-item">
            <a class="nav-link pointer text-danger" @click="$store.dispatch('logout')" v-if="isLoggedIn">Logout</a>
            <a class="nav-link pointer" @click="$router.push('/login')" v-else>Login</a>
          </li>
        </ul>
      </b-container>
    </nav>
    <router-view class="routerMe"/>
  </div>
</template>

<script>
export default {
  name: 'app',
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
    isStaff: function () {
      return this.$store.getters.isStaff
    },
    displayName: function () {
      return this.$store.getters.displayName
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Kanit');

#app {
  font-family: 'Kanit', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  width: 100%;
  height: 100%;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Kanit','Avenir', Helvetica, Arial, sans-serif;
}

html, body {
  font-family: 'Kanit','Avenir', Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100%;
}

.pointer {
  cursor: pointer;
}

.routerMe {
  margin-top: 12px;
}
</style>
