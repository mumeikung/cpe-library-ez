<template>
  <tr>
    <td>{{Name}}</td>
    <td>{{Author}}</td>
    <td>{{ISBN}}</td>
    <td>{{DueTime.toLocaleDateString()}}</td>
  </tr>
</template>

<script>
import firebase from '@/firebase'

export default {
  name: 'NowBorrowBox',
  props: ['stockID', 'DueTime'],
  data () {
    return {
      Name: '',
      Author: '',
      ISBN: ''
    }
  },
  mounted () {
    firebase.firestore().collection('stock').doc(this.stockID).get().then(function (doc) {
      if (doc.exists) {
        firebase.firestore().collection('book').doc(doc.data().ItemID).get().then(function (doc) {
          if (doc.exists) {
            this.Name = doc.data().Name
            this.Author = doc.data().Author
            this.ISBN = doc.data().ISBN
          }
        }.bind(this)).catch(function (error) {
          console.error(error)
        })
      }
    }.bind(this)).catch(function (error) {
      console.error(error)
    })
  }
}
</script>

<style>

</style>
