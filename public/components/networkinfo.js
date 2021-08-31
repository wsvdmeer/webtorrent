
class NetworkInfo extends HTMLElement {
  // constructor
  constructor () {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    this.info = document.createElement('div')
    this.info.innerText = 'Loading...'
    this.infoTimer = null
    const style = document.createElement('style')
    shadow.appendChild(style)
    shadow.appendChild(this.info)
  }

  connectedCallback () {
    this.getInfo()
  }

  disconnectedCallback () {
    clearTimeout(this.infoTimer)
    this.infoTimer = null
  }

  adoptedCallback () {
  }

  attributeChangedCallback (name, oldValue, newValue) {
  }

  // todo make into component
  async getInfo () {
    clearTimeout(this.infoTimer)
    await fetch('/api/info/')
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          this.info.innerText = `NETWORK [ external ip : ${result.network.externalip} country : ${result.network.country} internal ip ${result.network.internalip} port : ${result.network.port} ]  ACTIVITY [ download : ${result.torrents.downloadSpeed} upload : ${result.torrents.uploadSpeed} ratio :  ${result.torrents.ratio} progress ${result.torrents.progress} ]`
        }
      })
    this.infoTimer = setTimeout(() => { this.getInfo() }, 1000)
  }
}

customElements.define('networkinfo-component', NetworkInfo)
