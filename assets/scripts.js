var userLat = null;
var userLng = null;
var p = new Ping()

var servers = [
  { name: 'Europe', region: 'eu-west-1', lat: 53, lng: -8, marker: null, latency: null, previousLatency: null },
  { name: 'NA East', region: 'us-east-1', lat: 38.13, lng: -78.45, marker: null, latency: null, previousLatency: null },
  { name: 'NA West', region: 'us-west-1', lat: 37.35, lng: -121.96, marker: null, latency: null, previousLatency: null },
  { name: 'Brazil', region: 'sa-east-1', lat: -23.34, lng: -46.38, marker: null, latency: null, previousLatency: null },
  { name: 'Middle East', region: 'me-south-1', lat: 26.07, lng: 50.56, marker: null, latency: null, previousLatency: null },
  { name: 'Asia', region: 'ap-northeast-1', lat: 35.41, lng: 139.42, marker: null, latency: null, previousLatency: null },
  { name: 'Oceania', region: 'ap-southeast-2', lat: -33.86, lng: 151.2, marker: null, latency: null, previousLatency: null }
]

function getRandomId() {
  return Math.random().toString(36).substring(7)
}

function getUrl(region) {
  return 'https://ec2.' + region + '.amazonaws.com/ping'
}

function runPing(server, map, index, callback) {
  p.ping(getUrl(servers[index].region), function(err, data) {
    callback(data, map, index)
  })
}

function addUser(lat, lng, map) {
  map.loadImage(
    '/assets/user.png',
    function(error, image) {
      if (error) throw error;
      map.addImage('user', image);
      map.addSource('point', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [lng, lat]
              }
            }
          ]
        }
      })
      map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'point',
        'layout': {
          'icon-image': 'user',
          'icon-size': 1
        }
      })
    }
  )
}

function addServer(data, map, index) {
  // Only replace marker if lower ping or first ping
  if (servers[index].latency == null || servers[index].latency > data) {
    // Remove previous version of marker
    if (servers[index].marker) {
      servers[index].marker.remove()
    }

    servers[index].latency = data

    var el = document.createElement('div')
    el.className = 'marker'
    el.style.display = 'block'
    el.innerHTML = servers[index].name + '<br><strong>' + parseInt(data) + 'ms</strong>'

    if (parseInt(data) <= 40)
      el.classList.add('white')
    else if (parseInt(data) <= 150)
      el.classList.add('orange')
    else
      el.classList.add('red')

    servers[index].marker = new mapboxgl.Marker(el)
      .setLngLat([servers[index].lng, servers[index].lat])
      .addTo(map)
  }
}


$(function() {
  // Init map
  mapboxgl.accessToken = 'pk.eyJ1IjoicGpiIiwiYSI6ImNqYWJ0dmphdjEwaTgyeW51aHFiZWVxcDYifQ.qr1w1bDPh-RRRlRB9akknA'
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/pjb/ck9ls6ikt13eb1io13yzmig11',
    zoom: 1.5
  })

  // Add servers to map and rerun every 2 seconds
  var interval = setInterval(function() {
    servers.forEach(function(server, index) {
      runPing(getUrl(server), map, index, addServer)
    })
  }, 2000)

  // Add user to map and center map
  $.get("https://freegeoip.app/json/", function (data) {
    userLat = data.latitude
    userLng = data.longitude

    addUser(userLat, userLng, map)

    // Center map on marker
    map.flyTo({ center: [userLng, userLat] })
  }, "jsonp")
})
