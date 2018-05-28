<template>
  <b-container fluid>

    <b-container>
      <b-row class="anime" v-if="isStaff">
        <b-col cols="4">
          <img class="rounded myIMG" src="@/assets/Title.jpg">
        </b-col>
        <b-col cols="8" style="padding-left: 0px; padding-right: 0px;">
          <p style="font-size:40px;">{{userData.Name + ' ' + userData.Surname}}</p>
          <p style="margin-top:-20px;font-size:28px;">Account Type: Staff</p>
          <p style="margin-top:-10px;font-size:20px;">Gender : {{userData.Gender}}</p>
          <p style="margin-top:-10px;font-size:20px;">DOB : {{userData.DOB}}</p>
        </b-col>
      </b-row>
      <b-row class="anime" v-if="!isStaff">
        <b-col cols="4">
          <img class="rounded myIMG" src="@/assets/chokky.jpg">
        </b-col>
        <b-col cols="8" style="padding-left: 0px; padding-right: 0px;">
          <p style="font-size:40px;">{{userData.Name + ' ' + userData.Surname}}</p>
          <p style="font-size:28px;margin-top:-20px;">Account Type: Member</p>
          <p style="font-size:20px;margin-top:-10px;">Gender : {{userData.Gender}}</p>
          <p style="font-size:20px;margin-top:-10px;">DOB : {{userData.DOB}}</p>
          <p style="font-size:20px;margin-top:-10px;">Phone : {{userData.Phone.substr(0,3) + '-' + userData.Phone.substr(3,3) + '-' + userData.Phone.substr(6,4)}}</p>
        </b-col>
      </b-row>
    </b-container>
    <b-row v-if="!isStaff">
      <b-col>
        <p style="font-size:22px">Book Now Borrow</p>
        <table class="table">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Due Date</th>
          </tr>
          <now-borrow-box v-for="val in bookList" :key="val.borrowID" :stockID="val.stockID" :DueTime="val.DueTime"/>
        </table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import firebase from '@/firebase'
import NowBorrowBox from '@/components/NowBorrowBox'

export default {
  name: 'Info',
  data () {
    return {
      bookList: null
    }
  },
  components: {
    'now-borrow-box': NowBorrowBox
  },
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
    isStaff: function () {
      return this.$store.getters.isStaff
    },
    userData: function () {
      return this.$store.getters.userData === null ? {
        Name: '',
        Surname: '',
        Gender: '',
        DOB: '',
        Phone: ''
      } : this.$store.getters.userData
    },
    uid: function () {
      return this.$store.getters.uid
    }
  },
  mounted () {
    firebase.firestore().collection('borrow').where('Borrower', '==', this.uid).where('ReturnTime', '==', 'not yet').onSnapshot(function (docs) {
      this.bookList = null
      if (docs.size > 0) {
        let output = []
        docs.forEach((doc) => {
          output.push({
            borrowID: doc.id,
            stockID: doc.data().StockID,
            DueTime: new Date(doc.data().DueTime.seconds * 1000)
          })
        })
        this.bookList = output
      }
    }.bind(this), function (error) {
      console.error(error)
      this.bookList = null
    }.bind(this))
  }
}
</script>

<style>
.anime {
  animation-name: hiding;
  animation-duration: 3s;
}
.myIMG {
  width: 100%;
}
</style>
