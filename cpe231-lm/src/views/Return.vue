<template>
  <b-container>
    <return-book/>
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

</style>
