<template>
  <b-container fluid>
    <div id="div1">
    <borrow-book/>
    </div>
  </b-container>
</template>

<script>
import BorrowBook from '@/components/BorrowBook'

export default {
  name: 'Borrow',
  components: {
    'borrow-book': BorrowBook
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
