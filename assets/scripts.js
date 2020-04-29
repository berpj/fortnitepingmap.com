/*
  function randomId() {
    var d = new Date()
    return d.getMilliseconds()
  }
*/

function getUrl() {
  return 'https://ec2.eu-west-3.amazonaws.com/ping'
}

$(function() {
  var p = new Ping()

  window.setInterval(function() {
    p.ping(getUrl(), function(err, data) {
    	data = "eu-west-1 -> " + parseInt(data) / 2 + "ms<br>";
      $("#ping_results").append(data);
    })
  }, 750)

})
