<template>
  <b-container>
    <div id="div1">
    <h1>Edit Member</h1>
    <b-row class="rowmar">
      <b-col>
        <b-input-group @keyup.enter="memberSubmit">
          <b-form-input type="text" v-model="memberid" placeholder="Member ID" :disabled="memberData !== null || loading"/>
          <b-input-group-append>
            <b-btn @click="memberSubmit" :disabled="memberData !== null || memberid === null || memberid === '' || loading" variant="primary">Submit</b-btn>
            <b-btn @click="clearField" :disabled="memberData === null || loading" variant="danger">Cancel</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <hr>
      </b-col>
    </b-row>
    <b-row class="rowmar">
      <b-col>
        <b-row>
          <b-col class="text-left">
            Prefix  :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-select v-model="prefix" :options="options1" class="mb-3" :disabled="loading || memberData === null">
            </b-form-select>
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <b-row>
          <b-col class="text-left">
            Name  :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="name" type="text" :disabled="loading || memberData === null">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <b-row>
          <b-col class="text-left">
            Surname :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="surname" type="text" :disabled="loading || memberData === null">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row class="rowmar">
      <b-col>
        <b-row>
          <b-col class="text-left">
            Phone  :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="phone" type="tel" :disabled="loading || memberData === null">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <b-row>
          <b-col class="text-left">
            Date of Birth  :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="dob" type="date" :disabled="loading || memberData === null">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <b-row>
          <b-col class="text-left">
            Gender  :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-select v-model="gender" :options="options" class="mb-3" :disabled="loading || memberData === null">
            </b-form-select>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row class="rowmar">
      <b-col>
        <b-row>
          <b-col class="text-left">
            Borrow Level  :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="borrowLevel" type="range" min="1" max="127" :disabled="loading || memberData === null">
            </b-form-input>
            {{borrowLevel}}
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <b-row>
          <b-col class="text-left">
            Num Can Borrow  :
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-input v-model="numCanBorrow" type="number" min="0" :disabled="loading || memberData === null">
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row class="rowmar" v-if="errMsg !== '' && errMsg !== null">
      <b-col>
        <p class="text-danger">{{errMsg}}</p>
      </b-col>
    </b-row>
    <b-row class="rowmar">
      <b-col>
        <b-btn variant="success" :disabled="prefix === null || name === null || surname === null || dob === null || gender === null || phone === null || loading" @click="editMember">Save</b-btn>
      </b-col>
    </b-row>
    <b-modal ref="successModal" hide-header ok-only ok-title="ปิด" centered>
      แก้ไขข้อมูลสมาชิกเรียบร้อย
    </b-modal>
    </div>
  </b-container>
</template>

<script>
import firebase from '@/firebase'

export default {
  name: 'AddMember',
  data () {
    return {
      memberid: null,
      memberData: null,
      errMsg: '',
      prefix: null,
      name: null,
      surname: null,
      dob: null,
      gender: null,
      phone: null,
      numCanBorrow: 0,
      borrowLevel: 1,
      loading: false,
      options: [
        {value: null, text: '--Select Gender--'},
        {value: 'Male', text: 'Male'},
        {value: 'Female', text: 'Female'}
      ],
      options1: [
        {value: null, text: '--Select Prefix--'},
        {value: 'Mr.', text: 'Mr.'},
        {value: 'Mrs.', text: 'Mrs.'},
        {value: 'Miss', text: 'Miss'}
      ]
    }
  },
  mounted () {
    if (!this.$store.getters.isStaff) this.$router.push('/')
  },
  methods: {
    memberSubmit: function () {
      if (this.memberid === null || this.memberid === '') return ''
      this.loading = true
      this.errMsg = ''
      const getMemberData = firebase.functions().httpsCallable('getMemberData')
      getMemberData({uid: this.memberid}).then(function (resp) {
        console.log(resp.data)
        if (resp.data.message === undefined) {
          this.memberData = resp.data
          this.prefix = resp.data.Prefix
          this.name = resp.data.Name
          this.surname = resp.data.Surname
          this.dob = resp.data.DOB
          this.gender = resp.data.Gender
          this.phone = resp.data.Phone
          this.numCanBorrow = resp.data.NumCanBorrow
          this.borrowLevel = resp.data.BorrowLevel
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
    editMember: function () {
      console.log('add')
      this.loading = true
      const data = {
        uid: this.memberid,
        prefix: this.prefix,
        name: this.name,
        surname: this.surname,
        dob: this.dob,
        gender: this.gender,
        phone: this.phone,
        numCanBorrow: this.numCanBorrow.toString(),
        borrowLevel: this.borrowLevel.toString()
      }
      console.log(data)
      const editMember = firebase.functions().httpsCallable('editMember')
      editMember(data).then(function (resp) {
        if (resp.data === 'success') {
          this.$refs.successModal.show()
          this.clearField()
        } else {
          this.errMsg = resp.data.message
        }
        this.loading = false
      }.bind(this)).catch(function (error) {
        console.error(error)
        this.errMsg = error.message
        this.loading = false
      }.bind(this))
    },
    clearField: function () {
      this.prefix = null
      this.name = null
      this.surname = null
      this.dob = null
      this.gender = null
      this.phone = null
      this.numCanBorrow = 0
      this.borrowLevel = 1
      this.errMsg = ''
      this.memberid = null
      this.memberData = null
    }
  }
}
</script>

<style scoped>
  .rowmar{
    margin-top: 6px;
    margin-bottom: 6px;
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
