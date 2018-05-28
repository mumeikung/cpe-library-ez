<template>
  <b-container fluid>
    <borrow-book/>
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

</style>
