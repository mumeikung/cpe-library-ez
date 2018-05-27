<template>
  <b-container fluid>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
        <b-row>
          <b-col  class="text-left">
            Book Name :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="name" type="text" :disabled="loading">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
        <b-row>
          <b-col  class="text-left">
            Category ID :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
          <b-form-input v-model="categoryid" type="text" :disabled="loading">
            </b-form-input>
            <b-form-select v-model="categoryid" :options="options" class="mb-3" :select-size="4" :disabled="loading">
            </b-form-select>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
        <b-row>
          <b-col  class="text-left">
            Publisher :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="publisher" type="text" :disabled="loading">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
        <b-row>
          <b-col  class="text-left">
            Author :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="author" type="text" :disabled="loading">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
        <b-row>
          <b-col  class="text-left">
            ISBN :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="isbn" type="text" :disabled="loading">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
        <b-row>
          <b-col  class="text-left">
            Language :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="language" type="text" :disabled="loading">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
        <b-row>
          <b-col class="text-left">
            Shelf ID :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="shelfid" type="text" :disabled="loading">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
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
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6">
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
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <div class="row rowmar">
      <b-col sm="3"></b-col>
      <b-col sm="6" class="text-right">
        <b-button variant="success" @click="addNewBook" :disabled="name === null || categoryid === null || publisher === null || author === null || isbn === null || language === null || shelfid === null || borrowlevel < 1 || borrowlevel > 127 || amount < 1 || loading || !categoryValid ">Submit</b-button>
      </b-col>
      <b-col sm="3"></b-col>
    </div>
    <b-modal ref="msgModal" centered hide-header ok-only ok-title="ปิด">
      <p v-if="errMsg === ''">Success: {{success}}<br>
      Failed: {{failed}}</p>
      <p v-else>{{errMsg}}</p>
    </b-modal>
  </b-container>
</template>

<style scoped>
.rowmar{
  margin-top: 12px;
  margin-right: 0px;
  margin-bottom: 12px;
  padding: 0px;
}
</style>

<script>
import firebase from '@/firebase'

export default {
  name: 'Addbook',
  data () {
    return {
      id: null,
      name: null,
      categoryid: null,
      publisher: null,
      author: null,
      isbn: null,
      language: null,
      shelfid: null,
      borrowlevel: 1,
      amount: 1,
      options: [],
      category: {},
      success: null,
      failed: null,
      loading: false,
      errMsg: ''
    }
  },
  computed: {
    categoryValid: function () {
      if (this.category[this.categoryid] !== undefined) return true
      return false
    }
  },
  mounted () {
    if (!this.$store.getters.isStaff) this.$router.push('/search')
    firebase.firestore().collection('category').get().then(function (query) {
      if (query.size > 0) {
        let outdata = []
        query.forEach((doc) => {
          const getData = doc.data()
          outdata.push({
            value: getData.id,
            text: getData.id + ' : ' + getData.description
          })
          this.category[doc.id] = getData
        })
        this.options = []
        this.options = outdata
      }
    }.bind(this)).catch(function (error) {
      console.error(error)
    })
  },
  methods: {
    addNewBook: function () {
      this.loading = true
      const addBook = firebase.functions().httpsCallable('addBook')
      let data = {
        Name: this.name,
        CategoryID: this.categoryid,
        Publisher: this.publisher,
        Author: this.author,
        ISBN: this.isbn,
        Language: this.language,
        ShelfID: this.shelfid,
        Amount: parseInt(this.amount),
        BorrowLevel: parseInt(this.borrowlevel)
      }
      addBook(data).then(function (resp) {
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
    clearField: function () {
      this.name = null
      this.categoryid = null
      this.publisher = null
      this.author = null
      this.isbn = null
      this.language = null
      this.shelfid = null
      this.amount = 1
      this.borrowlevel = 1
    }
  }
}
</script>
