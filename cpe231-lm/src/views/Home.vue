<template>
  <b-row class="myRow">
    <div id="w">WELCOME|</div>
    <b-col>
      <b-row>
        <div id="L">{{isLoggedIn ? displayName : 'LIBRARY EASY'}}</div>
      </b-row>
      <b-row>
        <div id="j">{{isLoggedIn ? 'TO LIBRARY EASY' : 'A Database Final Project'}}</div>
      </b-row>
    </b-col>
    <div id="div1">
      <img  width="250" height="250" class="rounded" src="@/assets/book.png" style="margin-top:10vw;margin-right:15vw;">
    </div>
  </b-row>
</template>

<script>
export default {
  name: 'home',
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
    isStaff: function () {
      return this.$store.getters.isStaff
    },
    displayName: function () {
      return this.$store.getters.displayName
    }
  }
}
</script>

<style scoped>
.myRow {
  margin-left: 0px !important;
  margin-right: 0px !important;
}
#w {
  font-family: 'Kanit thin', sans-serif;
  font-size: 6.5vw;
  letter-spacing: 8px;
  margin-top: 10vw;
  margin-left: 10vw;
  animation: mymove 3s;
  animation-timing-function: ease;
  position: relative;
}
#L {
  font-family:'Kanit', sans-serif;
  font-size: 2.4vw;
  margin-top: 11.8vw;
  margin-left: 0px;
  animation-name: down;
  animation-duration: 3s;
  animation-fill-mode: forwards;
  position: relative;
}
#j {
  font-family:'Kanit thin', sans-serif;
  font-size: 2vw;
  margin-top: 0px;
  margin-left: 0px;
  animation-name: down;
  animation-duration: 3s;
  animation-fill-mode: forwards;
  position: relative;
}
#div1
{
  animation-name: slideleft;
  animation-duration: 4s;
  position: relative;
  animation-fill-mode: ease-in;
}

@keyframes mymove {
  from {opacity: 0.0;left: -600px;}
  to {opacity: 1.0;left: 0px;}
}
@keyframes down {
  0% {opacity: 0.0;top:-150px;}
  100% {opacity: 1.0;top:0px;}
}
@keyframes slideleft {
  from {opacity: 0.0;left: 300px}
  to {opacity: 1.0;left: 0px;}
}
@keyframes hiding {
  from {opacity: 0.0;}
  to {opacity: 1.0;}
}
</style>
