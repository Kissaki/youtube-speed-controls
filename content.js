function createContainer() {
  let container = document.createElement('div')
  container.className = 'pbspeed-container'
  container.style = 'margin:0 14px; display:grid; grid-template-columns: auto auto; gap:12px;'

  // Control layout:
  // | Display | 0.25 0.50 0.75 1.00
  // | Current | 1.25 1.50 1.75 2.00
  let setrsHTML = `<div class="setrs" style="display: grid; grid-template: 1fr 1fr / repeat(4, auto); column-gap: 6px;"><div>0.25</div><div>0.50</div><div>0.75</div><div>1.00</div><div>1.25</div><div>1.50</div><div>1.75</div><div>2.00</div></div>`
  let displayHTML = `<div class="rdisplay" style="display:inline-block; font-size:22px;">⏱ <span class="pbspeed-value"></span></div>`
  container.innerHTML = `${displayHTML}${setrsHTML}`

  let vid = document.querySelector('video.html5-main-video')
  let valEl = container.querySelector('.pbspeed-value')
  let updateDisplay = () => valEl.innerText = `${vid.playbackRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}x`
  updateDisplay()
  vid.addEventListener('ratechange', updateDisplay)

  container.querySelectorAll('.setrs > *').forEach(x => {
    x.addEventListener('click', () => vid.playbackRate = x.innerText)
    // container height 48px => element height 48 / 2 = 24 px
    x.style = 'font-size: 14px; line-height: 24px; display: flex; align-items: center; cursor: pointer;'
  })

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
