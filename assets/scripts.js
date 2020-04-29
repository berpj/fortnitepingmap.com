var p = new Ping()

var servers = [
  { name: 'Europe', region: 'eu-west-1', lat: 53, lng: -8, popup: null, data: null },
  { name: 'NA East', region: 'us-east-1', lat: 38.13, lng: -78.45, popup: null, data: null },
  { name: 'NA West', region: 'us-west-1', lat: 37.35, lng: -121.96, popup: null, data: null },
  { name: 'South America', region: 'sa-east-1', lat: -23.34, lng: -46.38, popup: null, data: null },
  { name: 'Middle East', region: 'me-south-1', lat: 26.07, lng: 50.56, popup: null, data: null },
  { name: 'Japan', region: 'ap-northeast-1', lat: 35.41, lng: 139.42, popup: null, data: null },
  { name: 'Oceania', region: 'ap-southeast-2', lat: -33.86, lng: 151.2, popup: null, data: null }
]

function getUrl(region) {
  return 'https://ec2.' + region + '.amazonaws.com/ping'
}

function runPing(server, map, index, callback) {
  p.ping(getUrl(servers[index].region), function(err, data) {
    callback(data, map, index)
  })
}

function addServer(data, map, index) {
  // Only replace popup if lower ping or first ping
  if (servers[index].data == null || servers[index].data > data) {
    // Remove previous version of popup
    if (servers[index].popup)
      map.removeLayer(servers[index].popup)

    servers[index].data = data

    servers[index].popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat([servers[index].lng, servers[index].lat])
    .setHTML(servers[index].name + "<br>" + parseInt(data) + "ms")
    .addTo(map)
  }
}


$(function() {
  // Init map
  mapboxgl.accessToken = 'pk.eyJ1IjoicGpiIiwiYSI6ImNqYWJ0dmphdjEwaTgyeW51aHFiZWVxcDYifQ.qr1w1bDPh-RRRlRB9akknA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 1.5
  })

  // Add servers to map and rerun every second
  var ran = 0
  var interval = setInterval(function() {
    servers.forEach(function(server, index) {
      runPing(getUrl(server), map, index, addServer)
    })

    if (++ran === 10)
      window.clearInterval(intervalID)
  }, 2000)

  // Add user to map and center map
  $.get("https://freegeoip.app/json/", function (data) {
    var lat = data.latitude;
    var lng = data.longitude;

    // Create marker
    var marker = new mapboxgl.Marker()
    .setLngLat([lng, lat])
    .addTo(map)

    // Center map on marker
    map.flyTo({ center: [lng, lat] });
  }, "jsonp")
})
