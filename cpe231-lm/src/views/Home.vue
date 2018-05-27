<template>
  <b-row class="myRow">
    <div id="w">WELCOME|</div>
    <b-col>
      <b-row>
        <div id="L">LIBRARY EASY</div>
      </b-row>
      <b-row>
        <div id="j">A Database Final Project</div>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'home'
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
  margin-top: 0px;
  margin-left: 10vw;
  animation: mymove 5s;
  animation-timing-function: ease;
}
#L {
  font-family:'Kanit', sans-serif;
  font-size: 2.4vw;
  margin-top: 2vw;
  margin-left: 0px;
  animation-name: down;
  animation-duration: 5s;
  animation-fill-mode: forwards;
}
#j {
  font-family:'Kanit thin', sans-serif;
  font-size: 2vw;
  margin-top: 0px;
  margin-left: 0px;
  animation-name: down;
  animation-duration: 5s;
  animation-fill-mode: forwards;
}
#div1
{
  animation-name: slideleft;
  animation-duration: 6s;
  position: relative;
  animation-fill-mode: ease-in;
}
@keyframes mymove {
  from {opacity: 0.0;left: -600px;}
  to {opacity: 1.0;left: 0px;}
}
@keyframes down {
  0% {opacity: 0.0;top:-300px;}
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
