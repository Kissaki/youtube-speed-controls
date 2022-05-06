function createContainer() {
  let container = document.createElement('div')
  container.className = 'pbspeed-container'
  container.style = 'margin:0 24px; display:grid; grid-template-columns: auto auto; gap:12px;'
  // Control layout:
  // | Display | 0.25 0.50 0.75 1.00
  // | Current | 1.25 1.50 1.75 2.00
  container.innerHTML = `<div class="rdisplay" style="display:inline-block; font-size:22px;">⏱ <span class="pbspeed-value"></span></div>
  <div class="setrs" style="display:grid; grid-template-columns:repeat(4, auto); gap: 2px;"><div>0.25</div><div>0.50</div><div>0.75</div><div>1.00</div><div>1.25</div><div>1.50</div><div>1.75</div><div>2.00</div></div>`

  let vid = document.querySelector('video.html5-main-video')
  let valEl = container.querySelector('.pbspeed-value')
  let updateDisplay = () => valEl.innerText = `${vid.playbackRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}x`
  updateDisplay()
  vid.addEventListener('ratechange', updateDisplay)

  container.querySelectorAll('.setrs > *').forEach(x => {
    x.addEventListener('click', () => vid.playbackRate = x.innerText)
    // height  ^î^      2px padding
    //   40px   |      14px row1 text (font-size + line-height)
    //          |       2px gap
    //          |      14px row2 text
    //         _|_      2px padding
    x.style = 'font-size: 14px; line-height: 14px; display: inline-block; padding: 2px 4px;'
    x.style.display = 'inline-block'
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
