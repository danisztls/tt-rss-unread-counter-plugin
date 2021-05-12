/* global chrome */

// DATA
// variables and classes are hoisted but not initialized if invoked before declaration
const defaults = {
  host: 'https://localhost/tt-rss',
  user: 'admin',
  mode: 0,
  interval: 5
}

class Setting {
  constructor (name, value) {
    this.name = name
    this.value = value
    this.input = document.querySelector('#opt-' + this.name)
  }

  // update placeholder and clear input field
  clear () {
    if (this.input.type !== 'select-one') {
      this.input.placeholder = this.value
      this.input.value = null // clear input
    } else {
      this.input.options[this.value].selected = true
    }
  }

  // read value from input field
  read () {
    if (this.input.value !== '' & this.input.value != null) { // ignore null
      this.value = this.input.value
      this.clear()
    }
    if (this.input.type === 'select-one') {
      this.value = parseInt(this.value)
    }
    return [this.name, this.value]
  }

  // reset to default value
  reset () {
    this.value = defaults[this.name]
    this.clear()
  }
}

// init 'Setting' objects
const settings = []
for (const opt of Object.entries(defaults)) {
  settings.push(new Setting(opt[0], opt[1]))
}

// MAIN
// Get settings from chrome.storage (use default when missing)
getOpts(defaults)

// Monitor click events
window.onload = () => {
  document.querySelector('#opt-save').onclick = saveOpts
  document.querySelector('#opt-reset').onclick = resetOpts
}

// LIB
// Load settings from chrome.storage
function getOpts (query) {
  const data = new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(query, resolve)
    } catch (e) {
      reject(e)
    }
  })
  data.then(setOpt)
}

// Set value for each option
async function setOpt (data) {
  for (const opt of settings) {
    opt.value = data[opt.name]
    opt.clear()
  }
}

// Save settings to chrome.storage
function saveOpts () {
  const payload = new Object() // eslint-disable-line no-new-object
  for (const opt of settings) {
    const data = opt.read()
    const name = data[0]
    const value = data[1]
    payload[name] = value
    opt.clear()
  }
  chrome.storage.sync.set(payload) // store opt
}

// Reset settings to default values
async function resetOpts () {
  for (const opt of settings) {
    opt.reset()
  }
  chrome.storage.sync.set(defaults)
}
