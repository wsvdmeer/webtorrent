const template = document.createElement('template')
template.innerHTML = `
<div>
    <!--Headline-->
    <p>Rating</p>
    <!--rating-stars-->
    <div class="rating-stars">
        <div class="rating-star star-1"></div>
        <div class="rating-star star-2"></div>
        <div class="rating-star star-3"></div>
        <div class="rating-star star-4"></div>
        <div class="rating-star star-5"></div>
    </div>
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
