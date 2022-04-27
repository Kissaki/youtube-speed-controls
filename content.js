function createContainer() {
  let container = document.createElement('div')
  container.className = 'pbspeed-container'
  container.style = 'margin:0 14px; display:grid; grid-template-columns: auto auto; gap:10px;'
  // Control layout:
  // | Display | 0.25 0.50 0.75 1.00
  // | Current | 1.25 1.50 1.75 2.00

  // little changes for compact design | added two slider(stacked): "input" for actual interaction and "fake" for visual reasons   
  container.innerHTML = `<div class="rdisplay" style="display:flex; justify-content:center; align-items:center;">⏱ <output class="pbspeed-value" style="display:flex;margin: 0em 0.4em 0em 0.2em"></output><div class="sliderdiv" style="display:flex;height:100%;justify-content:center;align-items:center"> <input class="pbspeed-slider" id="sliderinput" type="range" min="0" max="2" step="0.05" style="z-index:1;cursor:pointer;width:7em;height:100%;opacity:0"></input> <input class="pbspeed-slider" type="range" id="sliderfake" min="0" max="2" step="0.05" style="position:absolute;z-index:-1;width:7em;height:0.72em;-webkit-appearance:none;outline:none;opacity:0.70;background:#111111;box-shadow: inset 0 0 5px rgba(0, 0, 0, 1);"/></div>
  </div> 
 
  <div class="setrs" style="display:grid; grid-template-columns:repeat(4, auto); gap: 2px; margin: 0.3em 0em 0.3em 0em"><div>0.25</div><div>0.50</div><div>0.75</div><div>1.00</div><div>1.25</div><div>1.50</div><div>1.75</div><div>2.00</div></div>`

  let vid = document.querySelector('video.html5-main-video')
  let valEl = container.querySelector('.pbspeed-value')
  // Var the operational slider
  let slider = container.querySelector('#sliderinput')

  let updateDisplay = function(){
    valEl.innerText = `${vid.playbackRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}x`;
  // Update visible slider thumb position 
    slider.value = vid.playbackRate;
    container.querySelector('#sliderfake').value = slider.value
  }

  updateDisplay()
  vid.addEventListener('ratechange', updateDisplay)
 
  // Slider: mouseover selection to directly manipulate value with mousewheel | Pass value
  slider.addEventListener('mouseover', () => slider.focus())
  slider.addEventListener('input', () => vid.playbackRate = slider.value)



  container.querySelectorAll('.setrs > *').forEach(x => {
    x.addEventListener('click', () => vid.playbackRate = parseFloat(x.innerText).toFixed(2))
    // container height 48px => element height 48 / 2 = 24 px
    x.style = 'font-size: 12px; line-height: normal; display: flex; align-items: center; cursor: pointer; padding: 0px 2px;'
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
