<template>
  <div class="task-card">
    <textarea
      ref="textarea"
      v-model="text" 
      @input="textUpdated"
    ></textarea>
    <div class="estimate-buttons">
      <button @click="createNewTask('?')" :disabled="text.length == 0">?</button>
      <button @click="createNewTask('1 dy')" :disabled="text.length == 0">1 dy</button>
      <button @click="createNewTask('1 wk')" :disabled="text.length == 0">1 wk</button>
      <button @click="createNewTask('1 mo')" :disabled="text.length == 0">1 mo</button>
      <button @click="createNewTask('3 mo')" :disabled="text.length == 0">3 mo</button>
      <button @click="createNewTask('6 mo')" :disabled="text.length == 0">6 mo</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskCreator',
  props: {
    createTask: Function
  },
  data: function() {
    return {
      text: ''
    }
  },
  methods: {
    textUpdated: function() {
      const { textarea } = this.$refs
      textarea.style.height = textarea.scrollHeight + 1.5 + "px"
    },
    createNewTask: function(expected) {
      this.createTask({description: this.text, expected})
      this.text = ''
      this.textUpdated()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.task-card {
  padding: 7px;
  border-radius: 2px;
}

textarea {
  width: 100%;
  resize: vertical;
  box-sizing: border-box;
}

.estimate-buttons {
  display: flex;
  justify-content: center;
  column-gap: 3px;
}

.estimate-buttons button {
  flex: 1;
}
</style>
