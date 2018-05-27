<template>
  <b-container>
      <div class="row rowmar">
        <b-col sm="2"></b-col>
        <b-col sm="2">
          <b-row>
            <b-col class="text-left">
              Prefix :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-select v-model="prefix" :options="options1" class="mb-3">
              </b-form-select>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="3">
          <b-row>
            <b-col class="text-left">
              Name :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="name" type="text">
              </b-form-input>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="3">
          <b-row>
            <b-col class="text-left">
              Surname :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="surname" type="text">
              </b-form-input>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="2"></b-col>
      </div>

      <div class="row rowmar">
        <b-col sm="2"></b-col>
        <b-col sm="8">
          <b-row>
            <b-col class="text-left">
              Email :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="email" type="email">
              </b-form-input>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="2"></b-col>
      </div>

      <div class="row rowmar">
        <b-col sm="2"></b-col>
        <b-col sm="8">
          <b-row>
            <b-col class="text-left">
              Password :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="password" type="password">
              </b-form-input>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="2"></b-col>
      </div>

      <div class="row rowmar">
        <b-col sm="2"></b-col>
        <b-col sm="4">
          <b-row>
            <b-col class="text-left">
              Date of Birth :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="dob" type="date">
              </b-form-input>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="2">
          <b-row>
            <b-col class="text-left">
              Borrow Level :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="borrowLevel" type="number" min=1 max=127>
              </b-form-input>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="2">
          <b-row>
            <b-col class="text-left">
              Gender :
            </b-col>
          </b-row>
           <b-row>
            <b-col>
              <b-form-select v-model="gender" :options="options" class="mb-3">
              </b-form-select>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="2"></b-col>
      </div>

      <div class="row rowmar">
        <b-col sm="2"></b-col>
        <b-col sm="4">
          <b-row>
            <b-col class="text-left">
              Phone :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="phone" type="tel">
              </b-form-input>
            </b-col>
          </b-row>
        </b-col><b-col sm="4">
          <b-row>
            <b-col class="text-left">
              Num Can Borrow :
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-input v-model="numCanBorrow" type="number" min=0>
              </b-form-input>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="2"></b-col>
      </div>
  </b-container>
</template>

<style scoped>
  .rowmar{
    margin-top: 6px;
    margin-bottom: 6px;
  }
</style>

<script>
export default {
  data () {
    return {
      email: '',
      password: '',
      prefix: '',
      options1: [
        {value: 'Mr', text: 'Mr'},
        {value: 'Mrs', text: 'Mrs'},
        {value: 'Miss', text: 'Miss'}
      ],
      name: '',
      surname: '',
      dob: '',
      gender: '',
      options: [
        {value: 'male', text: 'male'},
        {value: 'female', text: 'female'}
      ],
      phone: '',
      numCanBorrow: '',
      borrowLevel: ''
    }
  }
}
</script>
