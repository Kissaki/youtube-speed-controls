class NormalPlayerObserver {
  // ytd-watch-flexy > #player-theater-container > #player-container > ytd-player#ytd-player > #container > #movie_player
  //                                                                                                                      > .html5-video-container > video
  //                                                                                                                      > .ytp-chrome-bottom > .ytp-chrome-controls > .ytp-left-controls
  // 2026: Controls hide differently now; #movie_player.ytp-autohide gets added resulting in opacity 0 with a transition declaration

  /** @param {(videoEl: HTMLVideoElement, controlsContainer: Element)} newPlayerCallback */
  constructor(newPlayerCallback) {
    /** @type {(videoEl: HTMLVideoElement, controlsContainer: Element)} */
    this._newPlayerCallback = newPlayerCallback

    this._find()
  }
  _find() {
    if (this._tryIdentify()) return

    document.addEventListener("yt-navigate-finish", this._onNavFinish.bind(this))
  }
  _onNavFinish() {
    this._tryIdentify()
  }
  _tryIdentify() {
    let playerContainer = document.querySelector('#player-container:has(#movie_player)')
    if (!playerContainer) return false

    let videoEl = playerContainer.querySelector('video')
    let controlsContainer = playerContainer.querySelector('.ytp-left-controls')
    if (!videoEl || !controlsContainer) return false

    this._newPlayerCallback(videoEl, controlsContainer)
    return true
  }
}

class ShortsPlayerObserver {
  // Shorts player DOM element layout (video and controls):
  // #shorts-container > #shorts-inner-container > ytd-reel-video-renderer[id][is-active][show-player-controls] > #player-container
  //                                                                                                                            > ytd-player#player > #container.ytd-player > #shorts-player > .html5-video-container > video
  //                                                                                                                            > .player-controls > ytd-shorts-player-controls > yt-icon-button
  // #shorts-inner-container > ytd-reel-video-renderer is loaded and inserted in sets of 10
  // delayed async load and insert of #player-container > ytd-player#player

  /** @param {(videoEl: HTMLVideoElement, controlsContainer: Element)} newPlayerCallback */
  constructor(newPlayerCallback) {
    /** @type {(videoEl: HTMLVideoElement, controlsContainer: Element)} */
    this._newPlayerCallback = newPlayerCallback
    this._pageContainer = null
    /** @type {MutationObserver} */
    this._pageContainerObserver = new MutationObserver(this._onPageContainerMutation.bind(this))

    if (this._findAndObserve()) return
    document.addEventListener("yt-navigate-finish", this._findAndObserve.bind(this))
  }

  _findAndObserve() {
    let pageContainer = document.querySelector('#shorts-inner-container')
    if (!pageContainer) return false

    this._pageContainer = pageContainer
    this._pageContainerObserver.observe(pageContainer, { childList: true })
    return true
  }

  /** @type {MutationCallback} */
  _onPageContainerMutation(mutList, observer) {
    let playerContainer = this._pageContainer.querySelector('#player-container:has(#shorts-player)')
    if (!playerContainer) return false

    let videoEl = playerContainer.querySelector('video')
    let controlsContainer = playerContainer.querySelector('.player-controls')
    if (!videoEl || !controlsContainer) return false

    this._newPlayerCallback(videoEl, controlsContainer)
    return true
  }
}

class Instance {
  /**
   * @param {HTMLVideoElement} video 
   * @param {Element} controlsContainer 
   */
  constructor(video, controlsContainer) {
    /** @type {HTMLVideoElement} */
    this._video = video
    this._controlsContainer = controlsContainer

    this._removeExisting()
    this._create()
    this._bind()
    this._updateRateDisplay()
    this._updateControlVisibility()
    this._insert()
  }
  _removeExisting() {
    let existing = this._controlsContainer.querySelector('.pbspeed-container')
    if (existing) existing.remove()
  }
  _create() {
    let container = document.createElement('div')
    container.className = 'pbspeed-container'

    let displayHTML = `<div class="rdisplay">⏱ <span class="pbspeed-value"></span></div>`
    let sliderHTML = `<input id="slider" class="pbspeed-slider" type="range" min="0" max="2" step="0.05" />`
    // Control layout:
    // | Display | 0.25 0.50 0.75 1.00
    // | Current | 1.25 1.50 1.75 2.00
    let presetsHTML = `<div class="setrs"><div>0.25</div><div>0.50</div><div>0.75</div><div>1.00</div><div>1.25</div><div>1.50</div><div>1.75</div><div>2.00</div></div>`
    container.innerHTML = `${displayHTML}${sliderHTML}${presetsHTML}`

    this._container = container
    this._display = container.querySelector('.rdisplay')
    this._rateDisplay = this._display.querySelector('.pbspeed-value')
    this._slider = container.querySelector('.pbspeed-slider')
    this._presets = container.querySelector('.setrs')
  }
  _bind() {
    this._video.addEventListener('ratechange', this._updateRateDisplay.bind(this))

    for (let x of this._presets.childNodes) x.addEventListener('click', this._onPresetClick.bind(this))
  
    this._slider.addEventListener('input', this._onSliderInput.bind(this))
    
    this._display.addEventListener('click', this._onRdisplayClick.bind(this))
    this._display.style.cursor = 'pointer'

    // (How) Can we listen to option changes from a content script?
    // browser.storage.onChanged.addEventListener(e => console.log(e))
    // browser.storage.local.addEventListener('changed', e => console.log(e))
    // browser.storage.local.onChanged.addEventListener(e => console.log(e))
  }
  _updateRateDisplay() {
    let value = this._video.playbackRate
    this._rateDisplay.innerText = `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`
    this._slider.value = value
  }
  _onPresetClick(e) {
    this._video.playbackRate = e.target.innerText
  }
  _onSliderInput(e) {
    this._video.playbackRate = e.target.value
  }
  _onRdisplayClick(e) {
    this._video.playbackRate = 1.0
  }
  async _updateControlVisibility() {
    let values = await browser.storage.local.get({ 'show-slider': true, 'show-presets': false })
    this._presets.style.display = values['show-presets'] ? 'grid' : 'none'
    this._slider.style.display = values['show-slider'] ? 'block' : 'none'
  }
  _insert() {
    // For Normal
    let timeDisplay = this._controlsContainer.querySelector('.ytp-time-display')
    if (timeDisplay) {
      timeDisplay.insertAdjacentElement('afterend', this._container)
      return true
    }

    // Fallback, for Shorts
    this._controlsContainer.appendChild(this._container)
    return true
  }
}

let init = async () => {
  document.head.insertAdjacentHTML('beforeend', `<style>
    .pbspeed-container { margin:0 14px; display:flex; align-items: center; gap:12px; }
    .pbspeed-container .rdisplay { grid-row: 1; grid-column: 1; font-size:22px; user-select: none; }
    .pbspeed-container .pbspeed-slider { grid-row: 1; grid-column: 3; width:7em; height:0.72em; -webkit-appearance:none; outline:none; opacity:0.70; background:#111111; box-shadow: inset 0 0 5px rgba(0, 0, 0, 1); border-radius: 4px; }#
    .pbspeed-container .setrs { grid-row: 1; grid-column: 3; display: none; grid-template: 1fr 1fr / repeat(4, auto); column-gap: 6px; }
    // container height 48px => element height 48 / 2 = 24 px
    .pbspeed-container .setrs > div { font-size: 14px; line-height: 24px; display: flex; align-items: center; cursor: pointer; }

    #movie_player.ytp-autohide .pbspeed-container, #player-container:has(#shorts-player.ytp-autohide) .pbspeed-container { opacity: 0; transition:opacity .1s cubic-bezier(.4,0,1,1); }
    </style>`
  )

  /** @type {(videoEl: HTMLVideoElement, controlsContainer: Element)} */
  let onNewPlayer = (videoEl, controlsContainer) => {
    console.debug('[YouTube Playback Speed Control] Identified elements, initializing controls…', videoEl, controlsContainer)
    new Instance(videoEl, controlsContainer)
  }
  new NormalPlayerObserver(onNewPlayer)
  new ShortsPlayerObserver(onNewPlayer)
}
init()
