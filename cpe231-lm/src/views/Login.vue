<template>
  <b-container v-if="!isLoggedIn">
    <div id="div1">
    <b-row class="rowgg">
      <b-col>
        <h1 style ="margin-left: auto; margin-right: auto;">LOGIN</h1>
      </b-col>
    </b-row>
    <b-row class="rowgg">
      <b-col sm="0" md="1"/>
      <b-col sm="12" md="9" @keyup.enter="$refs.passwordBox.focus()">
        <b-form-input v-model="email" type="email" :state="emailValid" placeholder="Enter email" />
      </b-col>
      <b-col sm="0" md="1"/>
    </b-row>
    <b-row class="rowgg">
      <b-col sm="0" md="1"/>
      <b-col sm="12" md="9">
        <b-form-input ref="passwordBox" v-model="password" type="password" :state="passwordValid" placeholder="Enter password"/>
      </b-col>
      <b-col sm="0" md="1"/>
    </b-row>
    <b-row class="rowgg">
      <b-col sm="0" md="1"/>
      <b-col sm="12" md="9">
        <b-row>
          <b-col sm="8" md="8" class="text-left">
            <b-form-checkbox id="checkbox1" v-model="status" :value="true" :unchecked-value="null" class="cbrow">
              I accept the terms and use
            </b-form-checkbox>
          </b-col>
          <b-col sm="4" md="4" class="text-right">
            <b-button variant="success" @click="login" :disabled="status !== true || email === null || password === null || loading">Login</b-button>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <p :class="msg === 'success' ? 'text-success' : 'text-danger'">{{msg === 'success' ? 'เข้าสู่ระบบเรียบร้อย' : msg}}</p>
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="0" md="1"/>
    </b-row>
    </div>
  </b-container>
</template>

<script>
export default {
  name: 'login',
  props: ['uid'],
  data () {
    return {
      email: null,
      password: null,
      status: null,
      msg: '',
      loading: false
    }
  },
  computed: {
    emailValid: function () {
      if (this.email === null) return null
      let regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i
      return regex.test(this.email)
    },
    passwordValid: function () {
      if (this.password === null) return null
      if (this.password.trim() === '') return false
      return true
    },
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    }
  },
  mounted () {
    if (this.$store.getters.isLoggedIn) this.$router.push('/')
  },
  methods: {
    login: function () {
      if (this.status === true && this.email !== null && this.password !== null && this.emailValid === true) {
        this.loading = true
        this.msg = ''
        this.$store.dispatch('login', {
          email: this.email,
          password: this.password
        }).then(function () {
          console.log('login success')
          this.$router.push('/')
        }.bind(this)).catch(function (err) {
          this.loading = false
          console.error(err)
          this.msg = err.message
        }.bind(this))
      }
    }
  }
}
</script>

<style scoped>
.rowgg{
  margin-top: 12px;
}
.lognrow{
  margin-top: 12px;
  width: 100%;
}
.cbrow{
  margin-top: 12px;
}
#div1
{
  animation-name: hiding;
  animation-duration: 3s;
}
@keyframes hiding {
  from {opacity: 0.0;}
  to {opacity: 1.0;}
}
</style>
