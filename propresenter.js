//protocol documentation: https://github.com/jeffmikels/ProPresenter-API

var currentDiv = document.getElementById("current");
var nextDiv = document.getElementById("next");

function setCurrent(slide) {
    if (currentDiv) {
       slideNew = "";
       slideSplitted = slide.split("\n");

       slideSplitted.forEach(function(element) {
           if (!element.startsWith(config['filter_lines_starts_with'])) {
               slideNew += element + "\n";
           }
       });

       slideHtml = slideNew.trim().replace(/\n/g, "<br />");
       currentDiv.innerHTML = slideHtml;
    }
}

function setNext(slide) {
    if (nextDiv) {
       slideNew = "";
       slideSplitted = slide.split("\n");

       slideSplitted.forEach(function(element) {
           if (!element.startsWith(config['filter_lines_starts_with'])) {
               slideNew += element + "\n";
           }
       });

       slideHtml = slideNew.trim().replace(/\n/g, "<br />");
       nextDiv.innerHTML = slideHtml;
    }
}

function processMessage(message) {
  //console.log(message);
  if (message.acn == "ath") {
    if (message.ath == true) {
      console.log("Authentication succeeded");
    } else {
      console.log("Authentication failed: " + message.err);
    }
  } else if (message.acn == "fv") {
    for(a in message.ary) {
      if (message.ary[a].acn == "cs") {
        setCurrent(message.ary[a].txt);
      } else if (message.ary[a].acn == "ns") {
        setNext(message.ary[a].txt);
      }
    }
  }
}

function connect() {
    var pp = 'ws://' + config['propresenter_ip'] + ':' + config['propresenter_port'] + '/stagedisplay';
    
    var ws = new WebSocket(pp);

    ws.onopen = function() {
        console.log('Connection established');
        ws.send(JSON.stringify({"pwd":config['propresenter_password'],"ptl":610,"acn":"ath"}));
    };

    ws.onmessage = function(e) {
        processMessage(JSON.parse(e.data));
    };

    ws.onclose = function(e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function() {
            connect();
        }, 1000);
    };

    ws.onerror = function(err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
    };
}

connect();
