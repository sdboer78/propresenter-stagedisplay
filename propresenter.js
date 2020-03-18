//protocol documentation: https://github.com/jeffmikels/ProPresenter-API

// fading is implemented by creating two divs, a current-a and a current-b
// for hard cuts, we use display, and for fades we use opacity
var nextDiv = document.getElementById("next");
var currentDivs = [document.getElementById("current-a"), document.getElementById("current-b")];
var currentIndex = 0;

function setCurrent(slide) {
	// remember the div that held the most recent slide update
	var oldDiv = currentDivs[currentIndex];

	// advance the index so the new text goes into the other currentDiv
	currentIndex = (currentIndex + 1) % 2;
	if (currentDivs[currentIndex]) {
		slideNew = "";

		slide = replaceNewLines(slide);

		//split
		slideSplitted = slide.split("\n");

		slideSplitted.forEach(function(element) {
			if (!element.startsWith(config["filter_lines_starts_with"])) {
				slideNew += element + "\n";
			}
		});

		slideHtml = slideNew.trim().replace(/\n/g, "<br />");
		currentDivs[currentIndex].innerHTML = slideHtml;
	}

	if (useFade) {
		currentDivs[currentIndex].style.opacity = 1;
		oldDiv.style.opacity = 0;
	} else {
		currentDivs[currentIndex].style.display = "block";
		oldDiv.style.display = "none";
	}
}

function setNext(slide) {
	if (nextDiv) {
		slideNew = "";

		slide = replaceNewLines(slide);

		//split
		slideSplitted = slide.split("\n");

		slideSplitted.forEach(function(element) {
			if (!element.startsWith(config["filter_lines_starts_with"])) {
				slideNew += element + "\n";
			}
		});

		slideHtml = slideNew.trim().replace(/\n/g, "<br />");
		nextDiv.innerHTML = slideHtml;
	}
}

function replaceNewLines(txt) {
	//replace all different new line types
	txt = txt.replace(/(?:\r\n|\r|\n|\u2028)/g, "\n");
	return txt;
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
		for (a in message.ary) {
			if (message.ary[a].acn == "cs") {
				setCurrent(message.ary[a].txt);
			} else if (message.ary[a].acn == "ns") {
				setNext(message.ary[a].txt);
			}
		}
	}
}

function configureFade() {
	currentDivs.forEach((e) => (e.style.transition = "opacity " + config["subtitle_fade_duration"] + "s"));
}

function connect() {
	var pp = "ws://" + config["propresenter_ip"] + ":" + config["propresenter_port"] + "/stagedisplay";

	var ws = new WebSocket(pp);

	ws.onopen = function() {
		console.log("Connection established");
		ws.send(JSON.stringify({ pwd: config["propresenter_password"], ptl: 610, acn: "ath" }));
	};

	ws.onmessage = function(e) {
		processMessage(JSON.parse(e.data));
	};

	ws.onclose = function(e) {
		console.log("Socket is closed. Reconnect will be attempted in 1 second.", e.reason);
		setCurrent("Waiting for data ...");
		setNext("Waiting for data ...");
		setTimeout(function() {
			connect();
		}, 1000);
	};

	ws.onerror = function(err) {
		console.error("Socket encountered error: ", err.message, "Closing socket");
		setCurrent("Waiting for data ...");
		setNext("Waiting for data ...");
		ws.close();
	};
}

connect();
configureFade();
