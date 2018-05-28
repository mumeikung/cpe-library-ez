<template>
  <b-row>
    <b-col>
      <h1>Borrow</h1>
      <b-container>
        <b-row>
          <b-col>
            <b-input-group @keyup.enter="memberSubmit">
              <b-form-input type="text" v-model="memberid" placeholder="Member ID" :disabled="memberData !== null || loading"/>
              <b-input-group-append>
                <b-btn @click="memberSubmit" :disabled="memberData !== null || memberid === null || memberid === '' || loading" variant="primary">Submit</b-btn>
                <b-btn @click="memberCancel" :disabled="memberData === null || loading" variant="danger">Cancel</b-btn>
              </b-input-group-append>
            </b-input-group>
          </b-col>
        </b-row>
      </b-container>
      <b-row v-if="memberData !== null">
        <b-col>
          <hr>
        </b-col>
      </b-row>
      <b-row v-if="memberData !== null">
        <b-col>
          <b-row>
            <b-col>
              <h3>{{memberData.Prefix}} {{memberData.Name}} {{memberData.Surname}}</h3>
            </b-col>
          </b-row>
          <b-container>
            <b-row class="myRow">
              <b-col>
                <b-input-group @keyup.enter="stockAdd">
                  <b-form-input ref="stockBox" type="text" v-model="stockid" placeholder="Stock ID" :disabled="loading || borrowed"/>
                  <b-input-group-append>
                    <b-btn @click="stockAdd" :disabled="stockid === null || stockid === '' || loading || borrowed" variant="primary">Add</b-btn>
                  </b-input-group-append>
                </b-input-group>
              </b-col>
            </b-row>
          </b-container>
          <b-row class="myRow">
            <b-col>
              <table class="table">
                <tr>
                  <th>
                    #
                  </th>
                  <th>
                    Name
                  </th>
                  <th>
                    Category
                  </th>
                  <th>
                    Author
                  </th>
                  <th>
                    Publisher
                  </th>
                  <th>
                    Language
                  </th>
                  <th>
                  </th>
                </tr>
                <tr v-for="(val, index) in borrowList" :key="val.StockID">
                  <td>
                    {{index+1}}
                  </td>
                  <td>
                    {{val.Name}}
                  </td>
                  <td>
                    {{val.Category}}
                  </td>
                  <td>
                    {{val.Author}}
                  </td>
                  <td>
                    {{val.Publisher}}
                  </td>
                  <td>
                    {{val.Language}}
                  </td>
                  <td>
                    <p v-if="val.success === true" class="text-success">ยืมสำเร็จ</p>
                    <p v-else-if="val.failed === true" class="text-danger">ยืมไม่สำเร็จ</p>
                    <b-btn v-else variant="danger" @click="removeStock(index)" :disabled="loading || borrowed">ลบ</b-btn>
                  </td>
                </tr>
              </table>
            </b-col>
          </b-row>
          <b-row class="myRow">
            <b-col>
              <b-btn variant="success" @click="borrow" :disabled="borrowList.length === 0 || loading || borrowed">ยืม</b-btn>
            </b-col>
            <b-col>
              <b-btn variant="primary" @click="memberCancel" :disabled="loading">ปิด</b-btn>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <!--b-btn @click="cateInsert">INSERT</b-btn-->
      <b-modal ref="msgModal" centered hide-header ok-only ok-title="ปิด">
        {{errMsg}}
      </b-modal>
    </b-col>
  </b-row>
</template>

<script>
import firebase from '@/firebase'

export default {
  name: 'borrowBook',
  data () {
    return {
      errMsg: '',
      memberid: null,
      memberData: null,
      loading: false,
      borrowList: [],
      stockid: null,
      borrowed: false
    }
  },
  watch: {
    errMsg: function (newV, oldV) {
      if (newV !== oldV && newV !== '') {
        this.$refs.msgModal.show()
      }
    }
  },
  methods: {
    cateInsert: function () {
      let json = ``
      let toJson = JSON.parse(json)
      for (const key in toJson) {
        if (toJson.hasOwnProperty(key)) {
          let element = toJson[key]
          element.RegisteredDate = new Date(element.RegisteredDate)
          firebase.firestore().collection('stock').doc(key).set(element).then(doc => {
            console.log(key)
          }).catch(error => {
            console.error(key, error)
          })
        }
      }
    },
    memberSubmit: function () {
      if (this.memberid === null || this.memberid === '') return ''
      this.loading = true
      this.errMsg = ''
      const getMemberData = firebase.functions().httpsCallable('getMemberData')
      getMemberData({uid: this.memberid}).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message === undefined) {
          this.memberData = resp.data
        } else {
          this.memberData = null
          this.errMsg = resp.data.message
        }
        this.loading = false
      }.bind(this)).catch(function (error) {
        console.error(error)
        this.memberData = null
        this.loading = false
      }.bind(this))
    },
    memberCancel: function () {
      this.memberData = null
      this.memberid = null
      this.stockid = null
      this.borrowList = []
      this.borrowed = false
      this.errMsg = ''
    },
    stockAdd: function () {
      if (this.stockid === null || this.stockid === '') return ''
      this.loading = true
      this.errMsg = ''
      const getBorrowBookInfo = firebase.functions().httpsCallable('getBorrowBookInfo')
      getBorrowBookInfo({
        uid: this.memberData.uid,
        StockID: this.stockid,
        CurrentNumGonnaBorrow: this.borrowList.length
      }).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message !== undefined) {
          this.errMsg = resp.data.message
        } else {
          const getData = resp.data
          const data = {
            Name: getData.book.Name,
            Category: getData.book.CategoryID,
            Publisher: getData.book.Publisher,
            Author: getData.book.Author,
            Language: getData.book.Language,
            StockID: getData.stock.id
          }
          let addto = true
          for (const key in this.borrowList) {
            if (this.borrowList.hasOwnProperty(key)) {
              const element = this.borrowList[key]
              if (element.StockID === data.StockID) addto = false
            }
          }
          if (addto) this.borrowList.push(data)
          this.stockid = null
        }
        this.loading = false
      }.bind(this))
    },
    removeStock: function (index) {
      this.borrowList.splice(index, 1)
    },
    borrow: function () {
      this.loading = true
      this.errMsg = ''
      let stockList = []
      this.borrowList.forEach((stock) => {
        stockList.push(stock.StockID)
      })
      const borrowBook = firebase.functions().httpsCallable('borrowBook')
      borrowBook({
        uid: this.memberid,
        stock: stockList
      }).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message !== undefined) {
          this.errMsg = resp.data.message
        } else {
          this.borrowed = true
          resp.data.forEach(function (stock, index) {
            if (stock === 'success') this.borrowList[index].success = true
            else if (stock === 'failed') this.borrowList[index].failed = true
          }.bind(this))
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
