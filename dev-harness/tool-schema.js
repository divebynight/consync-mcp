module.exports = {
  read_whiteboard: {
    required: [],
    description: "Read the current whiteboard contents"
  },
  append_whiteboard: {
    required: ["text"],
    description: "Append text to the whiteboard"
  }
};