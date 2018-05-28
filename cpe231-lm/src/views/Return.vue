<template>
  <b-container>
    <div id="div1">
    <return-book/>
    </div>
  </b-container>
</template>

<script>
import ReturnBook from '@/components/ReturnBook'

export default {
  name: 'Return',
  components: {
    'return-book': ReturnBook
  },
  mounted () {
    if (!this.$store.getters.isStaff) this.$router.push('/')
  }
}
</script>

<style>
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
