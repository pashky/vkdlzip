function extend(defaults, options) {
  var extended = {};
  var prop;
  for (prop in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
      extended[prop] = defaults[prop];
    }
  }
  for (prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      extended[prop] = options[prop];
    }
  }
  return extended;
};

function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

function clean(s) {
  return s.replace("/", "");
}

function cleana(s) {
  return clean(s).replace("E:\\music\\", "eM-");
}

function getBinary(file, then) {
  var xhr = new XMLHttpRequest();  
  xhr.open("GET", file, true);
  xhr.responseType = "arraybuffer";  
  xhr.send();
  xhr.onload = function(event) {
    then(xhr.response);
  };
}

function loadNext(audios, r) {
  if (audios.length == 0) {
    var blob = r.zip.generate({type:"blob"});
    chrome.tabs.sendMessage(r.tabid, {done:true, linkid: r.linkid});
    
    var time = r.time ? new Date(parseInt(r.time) * 1000) : new Date();
    var artists = Object.keys(r.artists).slice(0, 4).join(',');
    var zipname = pad(time.getMonth() + 1, 2) + '' + pad(time.getDate(), 2) + 
          ' ' + r.author + ' ' + artists + '.zip';

    saveAs(blob, zipname);
  } else {
    var a = audios[0];
    var fname = pad(a.n, 2) + " " + cleana(a.a) + " - " + clean(a.t) + ".mp3";
    console.log('Loading ' + fname + ' from ' + a.u);
    chrome.tabs.sendMessage(r.tabid, {current: r.audios.length - audios.length + 1, of: r.audios.length, linkid: r.linkid});
    if (!r.artists) {
      r.artists = {};
    }
    r.artists[a.a] = 1;
    getBinary(a.u, function (data) {
      r.zip.file(fname, data, {binary:true});
      loadNext(audios.slice(1), r);
    });
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.audios) {
      loadNext(request.audios, extend(request, {zip: new JSZip()}));
    } else if(request.init) {
      sendResponse({tabid:sender.tab.id});
    }
  }
);
