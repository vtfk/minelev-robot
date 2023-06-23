(async () => {
  // Process.exit when stuff crashes
  // Remember to close mongoclient when script is done

  const robot = require('./robot/index')

  try {
    await robot()
  } catch (error) {
    console.log(error)
  }
})()
