<template>
  <b-row>
    <b-col>
      <h1>Return</h1>
      <b-row>
        <b-col>
          <b-input-group @keyup.enter="returnBook">
            <b-form-input type="text" v-model="stockid" placeholder="Stock ID" :disabled="loading"/>
            <b-input-group-append>
              <b-btn @click="returnBook" :disabled="stockid === null || stockid === '' || loading" variant="primary">Return</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row class="myRow">
        <b-col>
          <h3>{{msg}}</h3>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
import firebase from '@/firebase'

export default {
  name: 'ReturnBook',
  data () {
    return {
      loading: false,
      stockid: null,
      msg: ''
    }
  },
  methods: {
    returnBook: function () {
      this.loading = true
      this.msg = ''
      const returnBook = firebase.functions().httpsCallable('returnBook')
      returnBook({StockID: this.stockid}).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message !== undefined) {
          this.msg = resp.data.message
        } else if (resp.data.status === 'success') {
          this.msg = 'คืนเรียบร้อย ค่าปรับทั้งหมด ' + resp.data.fine + ' บาท'
          this.stockid = null
        } else {
          this.msg = 'คืนไม่สำเร็จ'
        }
        this.loading = false
      }.bind(this))
    }
  }
}
</script>

<style scoped>
.myRow {
  margin-top: 12px;
}
</style>
