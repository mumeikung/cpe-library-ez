<template>
  <b-row class="myRow">
    <div id="w">DEVELOPER|</div>
    <b-col>
      <b-row>
        <div id="j1"> PHUMIPAK | SORAWIT </div>
      </b-row>
      <b-row>
        <div id="j"> JAKKATORN | WATCHARIN</div>
      </b-row>
    </b-col>
  </b-row>
</template>

<style>
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
#j1 {
  font-family:'Kanit', sans-serif;
  font-size: 2.4vw;
  margin-top: 11.5vw;
  margin-left: 0vw;
  animation-name: down;
  animation-duration: 3s;
  animation-fill-mode: forwards;
  position: relative;
}
#j {
  font-family:'Kanit', sans-serif;
  font-size: 2.4vw;
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
    0%   {opacity: 0.0;top:-150px;}
    100% {opacity: 1.0;top:0px;}
}
@keyframes slideleft {
    from   {opacity: 0.0;left: 300px}
    to {opacity: 1.0;left: 0px;}
}
@keyframes hiding {
    from   {opacity: 0.0;}
    to {opacity: 1.0;}
}
</style>
