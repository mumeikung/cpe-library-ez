<template>
  <b-container fluid>
    <b-row v-if="loading">
      <b-col>
        Loading...
      </b-col>
    </b-row>
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
      <b-col>
        <b-button variant="success" @click="editBook" :disabled="name === null || categoryid === null || publisher === null || author === null || isbn === null || language === null || shelfid === null || loading || !categoryValid ">Edit</b-button>
      </b-col>
    </div>
    <b-modal ref="msgModal" centered hide-header ok-only ok-title="ปิด" @ok="goback">
      {{errMsg}}
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
  props: ['bookid'],
  data () {
    return {
      name: null,
      categoryid: null,
      publisher: null,
      author: null,
      isbn: null,
      language: null,
      shelfid: null,
      options: [],
      category: {},
      loading: true,
      errMsg: '',
      goBackToSearch: false
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
    console.log('edit', this.bookid)
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
      this.errMsg = error.message
      this.goBackToSearch = true
    })
    firebase.firestore().collection('book').doc(this.bookid).get().then(function (doc) {
      if (doc.exists) {
        let data = doc.data()
        this.name = data.Name
        this.categoryid = data.CategoryID
        this.publisher = data.Publisher
        this.author = data.Author
        this.isbn = data.ISBN
        this.language = data.Language
        this.shelfid = data.ShelfID
        this.loading = false
      } else {
        this.errMsg = 'ไม่พบหนังสือดังกล่าว'
        this.goBackToSearch = true
      }
    }.bind(this)).catch(function (error) {
      console.error(error)
      this.errMsg = error.message
      this.goBackToSearch = true
    })
  },
  methods: {
    editBook: function () {
      this.loading = true
      let data = {
        bookID: this.bookid,
        Name: this.name,
        CategoryID: this.categoryid,
        Publisher: this.publisher,
        Author: this.author,
        ISBN: this.isbn,
        Language: this.language,
        ShelfID: this.shelfid
      }
      const editBook = firebase.functions().httpsCallable('editBook')
      editBook(data).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message !== undefined) {
          this.errMsg = resp.data.message
        } else if (resp.data === 'success') {
          this.errMsg = 'แก้ไขเรียบร้อย'
          this.goBackToSearch = true
        }
        this.loading = false
        this.$refs.msgModal.show()
      }.bind(this))
      console.log(data)
    },
    goback: function () {
      if (this.goBackToSearch === true) this.$router.push('/search')
    }
  }
}
</script>
