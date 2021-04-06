// create template
const template = document.createElement('template')
template.innerHTML = `
<style>
  div {
    margin-top: 20px;
    color: green;
  }
  </style>
  <div>
  <p>The Google search result of your name is <a target="_blank" rel="noopener">here</a></p>
  </div>
`

class SearchItem extends HTMLLIElement {
  constructor () {
    super()
    console.log('constructor')
  }

  static get observedAttributes () {
    return ['query']
  }

  attributeChangedCallback (name, oldVal, newVal) {
    if (oldVal !== newVal) {
      console.log(`${name} changed from ${oldVal} to ${newVal}`)
    }
  }

  adoptedCallback () {
    console.log('moved into a new DOM')
  }

  connectedCallback () {
    console.log('added to dom')
  }

  disconnectedCallback () {
    console.log('removed from DOM')
  }
}

window.customElements.define('search-item', SearchItem, {
  extends: 'li'
})
