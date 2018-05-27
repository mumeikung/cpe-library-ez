<template>
  <div class="hello">
    <b-container>
      <b-btn variant="danger" @click="logout">Logout</b-btn>
      <borrow-book class="myRow"/>
      <return-book class="myRow"/>
    </b-container>
  </div>
</template>

<script>
import firebase from '@/firebase'
import BorrowBook from '@/components/BorrowBook'
import ReturnBook from '@/components/ReturnBook'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  components: {
    'borrow-book': BorrowBook,
    'return-book': ReturnBook
  },
  methods: {
    logout: function () {
      firebase.auth().signOut().then(function () {
        // Sign-out successful.
        console.log('logout')
      }).catch(function (error) {
        // An error happened.
        console.error(error)
      })
    }
  }
}
</script>

<style scoped>
.myRow {
  margin-top: 24px;
}
</style>
