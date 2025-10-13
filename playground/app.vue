<script setup>
const { data } = await useFetch('/api/hello')
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
