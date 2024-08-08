

<template>
  <div>
    <input
      type="text"
      :value="username"
      @input="$emit('update:username', $event.target.value)"
    >
    <input
      type="text"
      :value="password"
      @input="$emit('update:password', $event.target.value)"
    >
  </div>
</template>

<script>

export default {
  props: {
    username: String,
    password: String,
  },
  username_rules: [
      (v) => !!v || 'Username is required',
      (v) => v.length >= 3 || 'Invalid username',
    ],
  password_rules: [(v) => !!v || 'Password is required'],
  emits: ['update:firstName', 'update:lastName'],

};

</script>

<style scoped lang="stylus">

</style>