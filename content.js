let existing = document.getElementById('pbspeed-container')
if (existing) {
  existing.remove()
}

function createContainer() {
  let container = document.createElement('div')
  container.id = 'pbspeed-container'
  container.style = 'margin:0 14px; display:flex; align-items: center; gap:12px;'

  let displayHTML = `<div class="rdisplay" style="grid-row: 1; grid-column: 1; font-size:22px;">⏱ <span class="pbspeed-value"></span></div>`
  let sliderHTML = `<input id="slider" class="pbspeed-slider" type="range" min="0" max="2" step="0.05" style="grid-row: 1; grid-column: 3; width:7em; height:0.72em; -webkit-appearance:none; outline:none; opacity:0.70; background:#111111; box-shadow: inset 0 0 5px rgba(0, 0, 0, 1); border-radius: 4px;"/>`
  // Control layout:
  // | Display | 0.25 0.50 0.75 1.00
  // | Current | 1.25 1.50 1.75 2.00
  let setrsHTML = `<div class="setrs" style="grid-row: 1; grid-column: 3; display: none; grid-template: 1fr 1fr / repeat(4, auto); column-gap: 6px;"><div>0.25</div><div>0.50</div><div>0.75</div><div>1.00</div><div>1.25</div><div>1.50</div><div>1.75</div><div>2.00</div></div>`
  container.innerHTML = `${displayHTML}${sliderHTML}${setrsHTML}`

  // Styling children en-mass
  // container height 48px => element height 48 / 2 = 24 px
  container.querySelectorAll('.setrs > *').forEach(x => x.style = 'font-size: 14px; line-height: 24px; display: flex; align-items: center; cursor: pointer;')

  let vid = document.querySelector('video.html5-main-video')
  let valEl = container.querySelector('.pbspeed-value')
  let slider = container.querySelector('#slider')

  let updateRateDisplay = () => {
    valEl.innerText = `${vid.playbackRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`
    slider.value = vid.playbackRate
  }
  let updateControlVisibility = async () => {
    let values = await browser.storage.local.get({ 'show-slider': false, 'show-presets': false })
    container.querySelector('.setrs').style.display = values['show-presets'] ? 'grid' : 'none'
    slider.style.display = values['show-slider'] ? 'block' : 'none'
  }

  vid.addEventListener('ratechange', updateRateDisplay)

  container.querySelectorAll('.setrs > *').forEach(x => x.addEventListener('click', () => vid.playbackRate = x.innerText))

  slider.addEventListener('input', e => vid.playbackRate = e.target.value)

  updateRateDisplay()
  updateControlVisibility()

  // (How) Can we listen to option changes from a content script?
  // browser.storage.onChanged.addEventListener(e => console.log(e))
  // browser.storage.local.addEventListener('changed', e => console.log(e))
  // browser.storage.local.onChanged.addEventListener(e => console.log(e))

  return container
}
let container = createContainer()

function insert() {
  let timeDisplay = document.querySelector('.ytp-time-display')
  if (timeDisplay) {
    timeDisplay.insertAdjacentElement('afterend', container)
    return true
  }

  let parent = document.querySelector('.ytp-left-controls')
  if (parent) {
    parent.appendChild(container)
    return true
  }

  console.warn('Failed to identify possible insertion targets')
  return false
}
function insertWithRepeatedTries(tryCount = 1) {
  // Try no more than 5 times
  if (tryCount > 5) {
    console.error('Failed to insert controls, even with repeated tries in hopes of ready player elements')
    return
  }
  if (!insert()) {
    // Try again after 200 ms
    setTimeout(insertWithRepeatedTries, 200, tryCount + 1)
  }
}
insertWithRepeatedTries()
