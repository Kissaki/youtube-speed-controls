(() =>{
  function getVideo() { return document.querySelector('video.html5-main-video') }

  let parent = document.querySelector('.ytp-left-controls')
  if (!parent) { console.error('no parent'); return; }

  let container = document.createElement('div')
  container.className = 'pbspeed-container'
  container.style = 'margin:0 24px; display:grid; grid-template-columns: auto auto; gap:12px;'
  // Control layout:
  // | Display | 0.25 0.50 0.75 1.00
  // | Current | 1.25 1.50 1.75 2.00
  container.innerHTML = `<div class="rdisplay" style="display:inline-block; font-size:22px;">⏱ <span class="pbspeed-value"></span></div>
  <div class="setrs" style="display:grid; grid-template-columns:repeat(4, auto); gap: 2px;"><div>0.25</div><div>0.50</div><div>0.75</div><div>1.00</div><div>1.25</div><div>1.50</div><div>1.75</div><div>2.00</div></div>`

  let vid = getVideo()
  let valEl = container.querySelector('.pbspeed-value')
  let updateDisplay = () => valEl.innerText = `${vid.playbackRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}x`
  updateDisplay()
  vid.addEventListener('ratechange', updateDisplay)

  container.querySelectorAll('.setrs > *').forEach(x => {
    x.addEventListener('click', () => vid.playbackRate = x.innerText)
    // height avail: 40 full, 20 row. 2x 2px padding; 20 - 4 = 16. container grid gap 2px; 16 - 2 = 14
    x.style = 'font-size: 12px; line-height: 12px; display: inline-block; padding: 2px 4px;'
    x.style.fontSize = '14px'
    x.style.lineHeight = '14px'
    x.style.display = 'inline-block'
  })

  let timeDisplay = parent.querySelector('.ytp-time-display')
  if (timeDisplay) {
    timeDisplay.insertAdjacentElement('afterend', container)
  } else {
    parent.appendChild(container)
  }
})()
