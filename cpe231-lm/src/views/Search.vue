<template>
  <b-container fluid>
    <div id="div1">
    <b-container>
      <b-row>
        <b-col>
          <b-input-group @keyup.enter="searchBook">
            <b-form-input v-model="search" type="text" placeholder="search book from title/publisher/ISBN" :disabled="loading"></b-form-input>
            <b-input-group-append>
              <b-btn @click="searchBook" :disabled="search === null || search === '' || loading" variant="primary">Search</b-btn>
            </b-input-group-append>
          </b-input-group>
          <p class="text-danger">{{msg}}</p>
        </b-col>
      </b-row>
    </b-container>
    <b-row v-if="searchData !== null">
      <b-col>
        <table class="table text-center">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Shelf</th>
              <th v-if="isStaff"></th>
            </tr>
            <tr v-if="searchCount <= 0">
              <td :colspan="isStaff ? 5 : 4">
                <h4>ไม่พบหนังสือ</h4>
                <b-button v-if="isStaff" @click="$router.push('/addbook')" variant="secondary" :disabled="loading">Add Book</b-button>
              </td>
            </tr>
            <tr v-else v-for="(val) in searchData" :key="val.id">
              <td>{{val.Name}}</td>
              <td>{{val.Author}}</td>
              <td>{{val.ISBN}}</td>
              <td>{{val.ShelfID}}</td>
              <td v-if="isStaff">
                <b-button-group size="sm">
                  <b-button @click="addModalBook(val)" :disabled="loading">Add book</b-button>
                  <b-button @click="editBook(val.id)" :disabled="loading">Edit book</b-button>
                </b-button-group>
              </td>
            </tr>
            <tr v-if="searchCount > 0 && isStaff">
              <td :colspan="5">
                <p>ไม่พบหนังสือที่จะเพิ่ม?</p>
                <b-button v-if="isStaff" @click="$router.push('/addbook')" variant="secondary" :disabled="loading">Add Book</b-button>
              </td>
            </tr>
        </table>
        <b-modal ref="addBook" title="Add Book" hide-header-close ok-title="Add" ok-variant="success" @ok="addSendToServer">
          <b-row v-if="nowBook !== null">
            <b-col  class="text-left">
              <p class="myP">
                Book: {{nowBook.Name}}<br>
                Author: {{nowBook.Author}}<br>
                Publisher: {{nowBook.Publisher}}<br>
                ISBN: {{nowBook.ISBN}}
              </p>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <hr>
            </b-col>
          </b-row>
          <b-row>
            <b-col  class="text-left">
              Borrow Level :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="borrowlevel" type="range" min="1" max="127" :disabled="loading">
              </b-form-input>
              {{borrowlevel}}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-left">
              Amount :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="amount" type="number" min="1" :disabled="loading">
              </b-form-input>
            </b-col>
          </b-row>
        </b-modal>
        <b-modal ref="msgModal" centered hide-header ok-only ok-title="ปิด">
          <p v-if="errMsg === ''">Success: {{success}}<br>
          Failed: {{failed}}</p>
          <p v-else>{{errMsg}}</p>
        </b-modal>
      </b-col>
    </b-row>
    </div>
  </b-container>
</template>

<script>
import firebase from '@/firebase'

export default {
  name: 'Search',
  data () {
    return {
      search: '',
      loading: false,
      searchCount: 0,
      searchData: null,
      msg: '',
      borrowlevel: 1,
      amount: 1,
      nowBook: null,
      success: null,
      failed: null,
      errMsg: ''
    }
  },
  computed: {
    isStaff: function () {
      return this.$store.getters.isStaff
    }
  },
  methods: {
    searchBook: function () {
      if (this.search === '') return ''
      this.loading = true
      this.msg = ''
      const searchBook = firebase.functions().httpsCallable('searchBook')
      searchBook({search: this.search}).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message !== undefined) {
          this.msg = resp.data.message
        } else {
          const searchResult = resp.data.hits
          this.searchCount = resp.data.total
          let output = []
          searchResult.forEach(function (data) {
            output.push({
              id: data._id,
              Author: data._source.Author,
              ISBN: data._source.ISBN,
              Name: data._source.Name,
              Publisher: data._source.Publisher,
              ShelfID: data._source.ShelfID,
              CategoryID: data._source.CategoryID,
              Language: data._source.Language
            })
          })
          this.searchData = output
        }
        this.loading = false
      }.bind(this))
    },
    addModalBook: function (book) {
      console.log('add', book.id)
      this.nowBook = book
      this.$refs.addBook.show()
    },
    addSendToServer: function () {
      let send = {
        id: this.nowBook.id,
        Amount: parseInt(this.amount),
        BorrowLevel: parseInt(this.borrowlevel)
      }
      this.loading = true
      const addBook = firebase.functions().httpsCallable('addBook')
      addBook(send).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message !== undefined) {
          this.errMsg = resp.data.message
        } else {
          this.errMsg = ''
          let success = 0
          let failed = 0
          resp.data.forEach((val) => {
            if (val === 'success') success++
            else failed++
          })
          this.success = success
          this.failed = failed
          this.clearField()
        }
        this.loading = false
        this.$refs.msgModal.show()
      }.bind(this))
    },
    editBook: function (bookID) {
      console.log('edit', bookID)
      this.$router.push({name: 'EditBook', params: {bookid: bookID}})
    },
    clearField: function () {
      this.nowBook = null
      this.borrowlevel = 1
      this.amount = 1
    }
  }
}
</script>

<style>
.myP {
  margin-bottom: 0px;
}
#div1
{
  animation-name: hiding;
  animation-duration: 2s;
}
@keyframes hiding {
  from {opacity: 0.0;}
  to {opacity: 1.0;}
}
</style>
