<template>
  <b-container>
    <b-row>
      <b-col>
        <h1>Check IN</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input-group @keyup.enter="checkIN">
          <b-form-input type="text" v-model="uidIN" placeholder="Users ID for Check IN" :disabled="loading"/>
          <b-input-group-append>
            <b-btn @click="checkIN" :disabled="uidIN === null || uidIN === '' || loading" variant="primary">IN</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p :class="msgIN === 'success' ? 'text-success' : 'text-danger'">{{msgIN === 'success' ? 'Check IN เรียบร้อย' : msgIN}}</p>
      </b-col>
    </b-row>
    <hr>
    <b-row>
      <b-col>
        <h1>Check OUT</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input-group @keyup.enter="checkOUT">
          <b-form-input type="text" v-model="uidOUT" placeholder="Users ID for Check OUT" :disabled="loading"/>
          <b-input-group-append>
            <b-btn @click="checkOUT" :disabled="uidOUT === null || uidOUT === '' || loading" variant="primary">OUT</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p :class="msgOUT === 'success' ? 'text-success' : 'text-danger'">{{msgOUT === 'success' ? 'Check OUT เรียบร้อย' : msgOUT}}</p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import firebase from '@/firebase'

export default {
  name: 'Check',
  data () {
    return {
      uidIN: null,
      uidOUT: null,
      loading: false,
      msgIN: '',
      msgOUT: ''
    }
  },
  methods: {
    checkIN: function () {
      if (this.uidIN === null || this.uidIN === '') return ''
      this.loading = true
      this.msgIN = ''
      const checkIn = firebase.functions().httpsCallable('checkIn')
      checkIn({uid: this.uidIN}).then(function (resp) {
        if (resp.data === 'success') {
          this.msgIN = 'success'
          this.uidIN = null
        } else {
          this.msgIN = resp.data.message
        }
        this.loading = false
      }.bind(this)).catch(function (error) {
        console.error(error)
        this.msgIN = error.message
      }.bind(this))
    },
    checkOUT: function () {
      if (this.uidOUT === null || this.uidOUT === '') return ''
      this.loading = true
      this.msgOUT = ''
      const checkOut = firebase.functions().httpsCallable('checkOut')
      checkOut({uid: this.uidOUT}).then(function (resp) {
        if (resp.data === 'success') {
          this.msgOUT = 'success'
          this.uidOUT = null
        } else {
          this.msgOUT = resp.data.message
        }
        this.loading = false
      }.bind(this)).catch(function (error) {
        console.error(error)
        this.msgOUT = error.message
      }.bind(this))
    }
  }
}
</script>

<style>

</style>
