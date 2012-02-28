var keyMapping;

function keyCodeToString(keyCode) {
  if (isAlphaNum(keyCode)) {
    return String.fromCharCode(keyCode);    
  }
  if (keyMapping)
    return keyMapping[keyCode];

  var mapping = {
    DOM_VK_SEMICOLON: ';',
    DOM_VK_EQUALS: '=',
    DOM_VK_COMMA: ',',
    DOM_VK_PERIOD: '.',
    DOM_VK_SLASH: '/',
    DOM_VK_BACK_QUOTE: '`',
    DOM_VK_OPEN_BRACKET: '[',
    DOM_VK_BACK_SLASH: '\\',
    DOM_VK_CLOSE_BRACKEY: ']',
    DOM_VK_QUOTE: '\'',
    DOM_VK_BACK_SPACE: 'backspace',
    DOM_VK_TAB: 'tab',
    DOM_VK_RETURN: 'return',
    DOM_VK_ENTER: 'enter',
    DOM_VK_PAGE_UP: 'pageup',
    DOM_VK_PAGE_DOWN: 'pagedown',
    DOM_VK_END: 'end',
    DOM_VK_HOME: 'home',
    DOM_VK_LEFT: 'left',
    DOM_VK_RIGHT: 'right',
    DOM_VK_UP: 'up',
    DOM_VK_DOWN: 'down',
    DOM_VK_INSERT: 'insert',
    DOM_VK_DELETE: 'delete',
    DOM_VK_SPACE: 'space',
    DOM_VK_F1: 'f1',
    DOM_VK_F2: 'f2',
    DOM_VK_F3: 'f3',
    DOM_VK_F4: 'f4',
    DOM_VK_F5: 'f5',
    DOM_VK_F6: 'f6',
    DOM_VK_F7: 'f7',
    DOM_VK_F8: 'f8',
    DOM_VK_F9: 'f9',
    DOM_VK_F10: 'f10',
    DOM_VK_F11: 'f11',
    DOM_VK_F12: 'f12',
    DOM_VK_SUBTRACT: '-'
  };
  var keyMapping = {};
  for (var prop in mapping) {
    keyMapping[KeyEvent[prop]] = mapping[prop];
  }
  return keyMapping[keyCode];
}

function noteFromKey(key) {
  var base = 4;
  switch (key) {
    case 'z':
      return 'C-' + base;
    case 'x':
      return 'C#' + base;
    case 'c':
      return 'D-' + base;
    case 'v':
      return 'D#' + base;
    case 'b':
      return 'E-' + base;
    case 'n':
      return 'F-' + base;
    case 'm':
      return 'F#' + base;
    case ',':
      return 'G-' + base;
    case '.':
      return 'G#' + base;
    case '/':
      return 'A-' + base;
    case 'a':
      return 'C-' + (base + 1);
    case 's':
      return 'C#' + (base + 1);
    case 'd':
      return 'D-' + (base + 1);
    case 'f':
      return 'D#' + (base + 1);
    case 'g':
      return 'E-' + (base + 1);
    case 'h':
      return 'F-' + (base + 1);
    case 'j':
      return 'F#' + (base + 1);
    case 'k':
      return 'G-' + (base + 1);
    case 'l':
      return 'G#' + (base + 1);
    case ';':
      return 'A-' + (base + 1);
    case '\'':
      return 'A#' + (base + 1);
    case '\\':
      return 'B-' + (base + 1);
    case 'q':
      return 'C-' + (base + 2);
    case 'w':
      return 'C#' + (base + 2);
    case 'e':
      return 'D-' + (base + 2);
    case 'r':
      return 'D#' + (base + 2);
    case 't':
      return 'E-' + (base + 2);
    case 'y':
      return 'F-' + (base + 2);
    case 'u':
      return 'F#' + (base + 2);
    case 'i':
      return 'G-' + (base + 2);
    case 'o':
      return 'G#' + (base + 2);
    case 'p':
      return 'A-' + (base + 2);
    case '[':
      return 'A#' + (base + 2);
    case ']':
      return 'B-' + (base + 2);
  }
}

function isNum(c) {
  return (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0));
}

function isAlpha(c) {
  return (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0));
}

function isAlphaNum(c) {
  return isAlpha(c) || isNum(c);
}

function ChannelData(numRows, rowData) {
  if (rowData) {
    this.rows = rowData;
  } else {
    this.rows = [];
    while (numRows--) {
      this.rows.push({});
    }
  }
}

ChannelData.prototype = {
  insertSpace: function(row) {
    var newRows = this.rows.slice(0, row);
    newRows.push({});
    newRows = newRows.concat(this.rows.slice(row, this.rows.length - 1));
    this.rows = newRows;
  },
  removeLine: function(row) {
    this.rows.splice(row, 1);
    this.rows.push({});
  }
};

function Pattern(numChannels, numRows, rowData) {
  this.numRows = numRows;
  this.channelData = [];
  while (numChannels--) {
    this.channelData.push(
      new ChannelData(numRows, rowData ? rowData.shift() : null));
  }
}

Pattern.prototype = {
};

function EditorInput() {
  this.numChannels = 8;
  this.numPatterns = 1;
  this.numColumns = 4;
  
  this.sample = 0;

  this.channel = 0;
  this.column = 0;
  this.row = 0;
  this.pattern = 0;
  this.position = 0;

  this.patterns = [];
  var n = this.numChannels;
  while (n--) {
    this.patterns.push(new Pattern(this.numChannels, 64));
  }
}

EditorInput.prototype = {
  adjustColumn: function(mod) {
    this.column += mod;
    if (this.column == this.numColumns) {
      if (this.adjustChannel(1)) {
        this.column = 0;        
      } else {
        this.column--;
      }
    } else if (this.column == -1) {
      if (this.adjustChannel(-1)) {
        this.column = this.numColumns - 1;
      } else {
        this.column++;
      }
    }
    this.updateUI();
  },

  adjustRow: function(mod, stayWithinPattern) {
    this.row += mod;
    if (this.row == this.patterns[this.pattern].numRows) {
      if (!stayWithinPattern && this.adjustPattern(1)) {
        this.row = 0;
      } else {
        this.row--;
      }      
    } else if (this.row == -1) {
      if (!stayWithinPattern && this.adjustPattern(-1)) {
        this.row = this.patterns[this.pattern].numRows - 1;
      } else {
        this.row++;
      }
    }
    this.updateUI();
  },
  
  adjustChannel: function(mod) {
    this.channel += mod;
    if (this.channel == -1) {
      this.channel++;
      return false;
    } else if (this.channel == this.numChannels) {
      this.channel--;
      return false;
    }
    return true;
  },
  
  adjustPattern: function(mod) {
    this.position += mod;
    if (this.position == this.mod.positionCount) {
      this.position--;
      return false;
    } else if (this.position == -1) {
      this.position++;
      return false;
    }
    this.pattern = this.mod.positions[this.position];
    this.generateEditorUI();
    this.updateUI();
    return true;
  },
  
  adjustSample: function(mod) {
    var instr = document.getElementById('instrument');
    this.sample += mod;
    if (this.sample == -1) {
      this.sample++;
    } else if (this.sample == instr.getElementsByTagName('option').length) {
      this.sample--;
    }
    instr.selectedIndex = this.sample;
  },
  
  _currentRow: function() {
    return this.patterns[this.pattern].channelData[this.channel].rows[this.row];
  },
  
  overwriteValue: function(keyCode) {
    switch (this.column) {
      case 0:
        if (isNum(keyCode))
          break;
        var row = this._currentRow();
        row.note = noteFromKey(keyCodeToString(keyCode));
        row.instrument = this.sample + (this.sample < 10 ? " " : "");
        this.adjustRow(1);
        break;
      case 1:
        return;
      case 2:
        if (!isNum(keyCode))
          break;
        var row = this._currentRow();
        var vol = 'volume' in row ? row.volume : '00';
        row.volume = vol.charAt(1) + String.fromCharCode(keyCode);
        break;
    }
    this.generateEditorUI();
    this.updateUI();
  },

  handleKeypress: function(ev) {
    if (ev.altKey || ev.ctrlKey /*|| ev.metaKey*/)
      return;

    var keyCode = ev.keyCode || ev.which;
    var key = keyCodeToString(keyCode);
    //console.log(keyCode);
    if (!ev.metaKey && (isAlphaNum(keyCode) ||
         ['[', ']', ';', '\'', ',', '.', '/', '\\'].indexOf(key) != -1)) {
      this.overwriteValue(keyCode);
      ev.preventDefault();
      return;
    }

    switch (key) {
      case 'left':
        this.adjustColumn(-1);
        break;

      case 'right':
        this.adjustColumn(1);
        break;

      case 'up':
        if (ev.metaKey) {
          this.adjustSample(-1);
        } else {
          this.adjustRow(-1);          
        }
        break;

      case 'down':
        if (ev.metaKey) {
          this.adjustSample(1);
        } else {
          this.adjustRow(1);
        }
        break;

      case 'home':
        if (this.column == 1)
          this.row = 1;
        this.column = 1;
        this.channel = 1;
        this.updateUI();
        break;

      case 'end':
        if (this.column == this.numColumns && this.channel == this.numChannels)
          this.row = this.patterns[this.pattern].numRows;
        this.column = this.numColumns;
        this.channel = this.numChannels;
        this.updateUI();
        break;

      case 'backspace':
        this.patterns[this.pattern].channelData[this.channel].removeLine(this.row);
        this.generateEditorUI();
        this.updateUI();
        break;

      case 'delete':
        var colName;
        switch (this.column) {
          case 0: colName = "note"; break;
          case 1: colName = "instrument"; break;
          case 2: colName = "volume"; break;
          case 3: colName = "effect"; break;
        }
        delete this.patterns[this.pattern].channelData[this.channel].rows[this.row][colName];
        this.generateEditorUI();
        this.updateUI();
        break;

      default:
        return;
    }
    ev.preventDefault();
  },
  
  generateEditorUI: function() {
    var channels = $('.channel');
    channels.each(function() { this.parentNode.removeChild(this); });

    var pattern = this.patterns[this.pattern];

    for (var i = 0; i < this.numChannels; i++) {
      var channel = document.createElement('span');
      $(channel).addClass('channel');
      document.getElementById('channels').appendChild(channel);
      while (channel.childNodes.length > 0) {
        channel.removeChild(channel.firstChild);
      }

      var header = document.createElement('div');
      $(header).addClass('header');
      header.textContent = "Channel " + (i + 1);
      channel.appendChild(header);

      for (var j = 0; j < pattern.numRows; j++) {
        var row = pattern.channelData[i].rows[j];
        var rowElem = document.createElement('div');
        $(rowElem).addClass('row');

        var elem = document.createElement('span');
        var hasContent = 'note' in row;
        $(elem).addClass(hasContent ? 'note' : 'blank');
        elem.textContent = hasContent ? row.note : '...';
        rowElem.appendChild(elem);

        elem = document.createElement('span');
        hasContent = 'instrument' in row;
        $(elem).addClass(hasContent ? 'instrument' : 'blank');
        elem.textContent = hasContent ? row.instrument : '..';
        rowElem.appendChild(elem);

        elem = document.createElement('span');
        hasContent = 'volume' in row;
        $(elem).addClass(hasContent ? 'volume' : 'blank');
        elem.textContent = hasContent ? row.volume : '..';
        rowElem.appendChild(elem);

        elem = document.createElement('span');
        $(elem).addClass(effectToClass(row));
        elem.textContent = 'effect' in row ? row.effect : '...';
        rowElem.appendChild(elem);

        channel.appendChild(rowElem);
      }
    }
    
    function effectToClass(row) {
      if (!('effect' in row))
        return 'blank';
      switch (row.effect[0]) {
        case 'C':
          return 'setvolume';
        case 'D':
          return 'patternbreak';
        default:
          break;
      }
      return 'effect';
    }
  },
  
  updateUI: function() {
    $('.row-highlight').removeClass('row-highlight');
    $('.highlight').removeClass('highlight');
    var channels = $('.channel');
    var idx = 0;
    var self = this;
    $(channels).each(function() {
      var row = $($(this).find('.row')[self.row]);
      row.addClass('row-highlight');
      if (idx++ == self.channel) {
        $(row.find('span')[self.column]).addClass('highlight');
      }
    });
  },
  
  loadMOD: function(mod) {
    this.mod = mod;
    this.numPatterns = mod.patternCount;
    this.numChannels = mod.channelCount;
    this.position = 0;
    this.pattern = mod.positions[this.position];
    this.patterns = [];
    for (var i = 0; i < this.numPatterns; i++) {
      var rowData = [];
      for (var j = 0; j < this.numChannels; j++) {
        var rows = [];
        for (var k = 0; k < 64; k++) {
          var modRow = mod.patterns[i][k][j];
          var data = {};
          if (modRow.period && validNote(modRow.period))
            data.note = periodToDisplay(modRow.period);
          if (modRow.sample)
            data.instrument = (modRow.sample < 10 ? "0" : "") + modRow.sample;
          if (modRow.effect)
            data.effect = modRow.effect.toString(16).toUpperCase() +
                            (modRow.effectParameter < 16 ? "0" : "" ) +
                            modRow.effectParameter.toString(16).toUpperCase();
          rows.push(data);
        }
        rowData.push(rows);
      }
      this.patterns.push(new Pattern(this.numChannels, 64, rowData));
    }
    this.generateEditorUI();
    this.updateUI();
  },
  
  mod: null
};

function validNote(period) {
  var noteNum = ModPeriodToNoteNumber[period];
  return noteNum >= 1 && noteNum <= 120;
}

function periodToDisplay(period) {
  var noteNum = ModPeriodToNoteNumber[period];
  var name = ["C-", "C#", "D-", "D#", "E-", "F-", "F#", "G-", "G#", "A-", "A#", "B-"][(noteNum) % 12];
  return name + (Math.floor(noteNum / 12) + 2);
}

var modPlayer;
var editor;

var playing = false;
var channels = 2;	//stereo
var sampleRate = 44100;
var bufferSize = 2048 * channels; 
var prebufferSize = 12 * channels * 1024; // defines the latency

var outputAudio = new Audio();

//writeAudio thanks to: http://www.toverlamp.org/static/HTML5-Guitar-Tab-Player/
// function that describes the audio chain
var currentWritePosition = 0;
var lastSampleOffset = 0;
function writeAudio() {
  if (!playing) { return; }
  var currentSampleOffset = outputAudio.mozCurrentSampleOffset();
  var playHasStopped = currentSampleOffset == lastSampleOffset; // if audio stopped playing, just send data to trigger it to play again.
  while (currentSampleOffset + prebufferSize >= currentWritePosition || playHasStopped ) {
    // generate audio
    var audioData = modPlayer.getSamples(bufferSize);
    
    // write audio	
    var written = outputAudio.mozWriteAudio(audioData);
    currentWritePosition += written;	//portionSize;
    currentSampleOffset = outputAudio.mozCurrentSampleOffset();
    playHasStopped = 0;
    if (written < audioData.length) { // firefox buffer is full, stop writing
      return;
    }
  }
  lastSampleOffset = outputAudio.mozCurrentSampleOffset();
}

function play() {
  playing = true;
}

// setup audio output
function init() {
  //status = document.getElementById("status");
  if(outputAudio.mozSetup) {
    outputAudio.mozSetup(2, sampleRate);
    writeAudio(); // initial write
    var writeInterval = Math.floor(1000 * bufferSize / sampleRate);
    setInterval(writeAudio, writeInterval);
  }
}

function stop() {
  playing = false;
}

/* load from harddrive using HTML5 File API */
function loadLocal(file) {
  var reader = new FileReader();
  /* ugly-ass closure nonsense */
  reader.onload = (function(theFile) {
		     return function(e) {
		       /* actually load mod once we're passed the file data */
		       theFile = e.target.result; /* get the data string out of the blob object */
		       var modFile = new ModFile(theFile);
                       editor.loadMOD(modFile);
		       modPlayer = new ModPlayer(modFile, 44100);
		       //play();
		       document.getElementById('status').innerText = '';
		     };
		   })(file);

  reader.readAsBinaryString(file);
  document.getElementById('status').innerText = '';
}

function loadRemote(path) {
  var fetch = new XMLHttpRequest();
  fetch.open('GET', path);
  fetch.overrideMimeType("text/plain; charset=x-user-defined");
  fetch.onloadend = function() {
      /* munge response into a binary string */
      var t = this.responseText || "" ;
      var ff = [];
      var mx = t.length;
      var scc= String.fromCharCode;
      for (var z = 0; z < mx; z++) {
	ff[z] = scc(t.charCodeAt(z) & 255);
      }
      var binString = ff.join("");
      
      var modFile = new ModFile(binString);
      modPlayer = new ModPlayer(modFile, 44100);
      editor.loadMOD(modFile);
      //play();
      //document.getElementById('status').innerText = '';
  };
  //document.getElementById('status').innerText = 'loading...';
  fetch.send();
}

$(document).ready(function() {
  editor = new EditorInput();
  $(window).keypress(editor.handleKeypress.bind(editor));
  editor.generateEditorUI();
  editor.updateUI();
  init();
  //dynamicAudio = new DynamicAudio({'swf': 'dynamicaudio.swf'});  
  loadRemote('sundance.mod');
});

