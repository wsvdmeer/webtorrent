const request = (path, query, callback) => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', path + JSON.stringify(query), true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.responseText) {
        const result = JSON.parse(xhr.responseText)
        callback(result)
      }
    }
  }
  xhr.send()
}
