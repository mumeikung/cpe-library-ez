<template>
  <b-container fluid>
    <b-btn @click="loopTEST" variant="danger" :disabled="loading" style="margin-bottom: 24px;">Load All Analysis</b-btn>
    <b-card>
      <b-row>
        <b-col cols="6" v-for="val in list" :key="val.id" class="myRow">
          <b-card>
            <b-row v-for="opt in val.opts" :key="opt">
              <b-col>
                <b-btn @click="getAnalysis(val.id, opt)" variant="primary" :disabled="loading">Load Analysis</b-btn>
              </b-col>
              <b-col>
                {{name['s_' + val.id]['opt_' + opt]}}
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>
      <hr>
      <h2>{{nowName}}</h2>
      <b-row v-if="result !== null" class="myRow">
        <b-col>
          <table class="table">
            <tr>
              <th v-for="(val, key) in result[0]" :key="'head_' + key">
                {{key}}
              </th>
            </tr>
            <tr v-for="(value, index) in result" :key="index">
              <td v-for="(myValue, myIndex) in value" :key="index + '_' + myIndex">
                {{myValue}}
              </td>
            </tr>
          </table>
        </b-col>
      </b-row>
    </b-card>
  </b-container>
</template>

<script>
import firebase from '@/firebase'

export default {
  name: 'About',
  data () {
    return {
      name: {
        s_1057: {
          opt_1: 'เดือนที่หนังสือถูกยืมมากที่สุด (จำนวนครั้ง)',
          opt_2: 'หนังสือที่ถูกยืมมากที่สุด (จำนวนครั้ง)',
          opt_3: 'หนังสือที่มีระยะเวลาการถูกยืมมากที่สุด (จำนวนวัน)'
        },
        s_1070: {
          opt_1_in: 'ช่วงเวลาที่มีการเข้าห้องสมุดมากที่สุด',
          opt_1_out: 'ช่วงเวลาที่มีการออกห้องสมุดมากที่สุด',
          opt_2: 'วันที่มีคนเข้าใช้งานห้องสมุดมากที่สุด',
          opt_3: 'คนที่มีเวลาใช้บริการห้องสมุดมากที่สุด'
        },
        s_1085: {
          opt_1: 'ค่าปรับที่ได้รับต่อเดือน',
          opt_2: 'เพศและอายุของสมาชิก',
          opt_3: 'เดือนที่นาเข้าหนังสือมากที่สุด'
        },
        s_1093: {
          opt_1: 'Top publishers that have a lot of books in our library database',
          opt_2: 'Top 10 categories in our library database',
          opt_3: 'Top 10 books in our library database'
        }
      },
      list: [
        {
          id: '1057',
          opts: ['1', '2', '3']
        },
        {
          id: '1070',
          opts: ['1_in', '1_out', '2', '3']
        },
        {
          id: '1085',
          opts: ['1', '2', '3']
        },
        {
          id: '1093',
          opts: ['1', '2', '3']
        }
      ],
      nowName: 'Select Your Analysis',
      result: null,
      results: {},
      loading: false
    }
  },
  methods: {
    loopTEST: function () {
      this.list.forEach(function (data) {
        data.opts.forEach(function (opt) {
          this.getAnalysis(data.id, opt)
        }.bind(this))
      }.bind(this))
    },
    getAnalysis: function (id, opt) {
      console.log(id, opt)
      this.loading = true
      this.nowName = this.name['s_' + id]['opt_' + opt]
      console.log(this.name['s_' + id]['opt_' + opt])
      if (this.results[id] !== undefined && this.results[id]['opt_' + opt] !== undefined) {
        this.result = this.results[id]['opt_' + opt]
        this.loading = false
      } else {
        const getAnalysis = firebase.functions().httpsCallable('analysis' + id + '_' + opt)
        getAnalysis().then(function (resp) {
          console.log(resp.data)
          if (this.results[id] === undefined) this.results[id] = {}
          this.results[id]['opt_' + opt] = resp.data
          this.result = resp.data
          this.loading = false
        }.bind(this)).catch(function (error) {
          console.error(error)
          this.result = null
          this.loading = false
        }.bind(this))
      }
    }
  }
}
</script>

<style>
.myRow {
  margin-top: 24px;
  margin-left: 0px !important;
  margin-right: 0px !important;
}
</style>
