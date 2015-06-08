chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var link = $('#' + request.linkid);
    if (request.current) {
      link.html('Downloading ' + request.current + '/' + request.of);
    } else if (request.done) {
      link.html('Downloaded');
    }
  }
);

chrome.runtime.sendMessage({init:true}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
	  clearInterval(readyStateCheckInterval);

      console.log('vkdlzip loaded');

      $.fn.text = function() {
        if (this[0]) {
          return ('' + this[0].textContent).trim();
        }
        return '';
      };

      function insertLinks() {
        $('.post,#fw_post').forEach(function (post) {
          if ($('.vkdlzip', post).length) return;

          var audios = [];
          var n = 1;
          $('.audio', post).forEach(function (audio) {
            var url = $('input[id^="audio_info"]', audio).val().split(',')[0];
            if (url) {
              var artist = $('b a', audio).text();
              var title = $('span.title', audio).text();
              audios.push({n: n, a: artist, t: title, u: url});
              ++n;
            }
          });

          var author = $('.wall_text .author,.fw_post_author', post).text();
          var title = $('.wall_post_text', post).text();
          var time = $('.rel_date', post).attr('time');

          if (audios.length > 0) {
            var linkid = 'vkdlzip' + post.id;
            var link = $('&nbsp;-&nbsp;<a class="vkdlzip" href="#" id="' + linkid + '">Download</a>');
            $('.wall_text .author,.fw_post_author', post).parent().append(link);
            link.on('click', function (e) {
              chrome.runtime.sendMessage({
                audios: audios,
                linkid: linkid,
                tabid: response.tabid,
                author: author,
                title: title,
                time: time
              });
              e.preventDefault();
            });
          }        
        });
      }
      
      insertLinks();

      var rows = $('.feed_row').length;
      setInterval(function() {
        var newrows = $('.feed_row').length;
        if (newrows != rows) {
          insertLinks();
        }
        rows = newrows;
      }, 1000);
    }
  });
});
