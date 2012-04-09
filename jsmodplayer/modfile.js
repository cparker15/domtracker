var channelCountByIdentifier = {
	'TDZ1': 1, '1CHN': 1, 'TDZ2': 2, '2CHN': 2, 'TDZ3': 3, '3CHN': 3,
	'M.K.': 4, 'FLT4': 4, 'M!K!': 4, '4CHN': 4, 'TDZ4': 4, '5CHN': 5, 'TDZ5': 5,
	'6CHN': 6, 'TDZ6': 6, '7CHN': 7, 'TDZ7': 7, '8CHN': 8, 'TDZ8': 8, 'OCTA': 8, 'CD81': 8,
	'9CHN': 9, 'TDZ9': 9,
	'10CH': 10, '11CH': 11, '12CH': 12, '13CH': 13, '14CH': 14, '15CH': 15, '16CH': 16, '17CH': 17,
	'18CH': 18, '19CH': 19, '20CH': 20, '21CH': 21, '22CH': 22, '23CH': 23, '24CH': 24, '25CH': 25,
	'26CH': 26, '27CH': 27, '28CH': 28, '29CH': 29, '30CH': 30, '31CH': 31, '32CH': 32
}

function ModFile(mod) {
	function trimNulls(str) {
		return str.replace(/\x00+$/, '');
	}
	function getWord(str, pos) {
		return (str.charCodeAt(pos) << 8) + str.charCodeAt(pos+1)
	}

	this.data = mod;
	this.samples = [];
	this.sampleData = [];
	this.positions = [];
	this.patternCount = 0;
	this.patterns = [];
	
	this.title = trimNulls(mod.substr(0, 20));

	this.sampleCount = 31;

	for (var i = 0; i < this.sampleCount; i++) {
		var sampleInfo = mod.substr(20 + i*30, 30);
		var sampleName = trimNulls(sampleInfo.substr(0, 22));
		this.samples[i] = {
			length: getWord(sampleInfo, 22) * 2,
			finetune: sampleInfo.charCodeAt(24),
			volume: sampleInfo.charCodeAt(25),
			repeatOffset: getWord(sampleInfo, 26) * 2,
			repeatLength: getWord(sampleInfo, 28) * 2,
                        name: sampleName
		}
	}
	
	this.positionCount = mod.charCodeAt(950);
	this.positionLoopPoint = mod.charCodeAt(951);
	for (var i = 0; i < 128; i++) {
		this.positions[i] = mod.charCodeAt(952+i);
		if (this.positions[i] >= this.patternCount) {
			this.patternCount = this.positions[i]+1;
		}
	}
	
	this.identifier = mod.substr(1080, 4);
	
	this.channelCount = channelCountByIdentifier[this.identifier];
	if (!this.channelCount) {
		this.channelCount = 4;
	}
	
	var patternOffset = 1084;
	for (var pat = 0; pat < this.patternCount; pat++) {
		this.patterns[pat] = [];
		for (var row = 0; row < 64; row++) {
			this.patterns[pat][row] = [];
			for (var chan = 0; chan < this.channelCount; chan++) {
				b0 = mod.charCodeAt(patternOffset);
				b1 = mod.charCodeAt(patternOffset + 1);
				b2 = mod.charCodeAt(patternOffset + 2);
				b3 = mod.charCodeAt(patternOffset + 3);
				var eff = b2 & 0x0f;
				this.patterns[pat][row][chan] = {
					sample: (b0 & 0xf0) | (b2 >> 4),
					period: ((b0 & 0x0f) << 8) | b1,
					effect: eff,
					effectParameter: b3
				};
				if (eff == 0x0E) {
					this.patterns[pat][row][chan].extEffect = (b3 & 0xF0) >> 4;
					this.patterns[pat][row][chan].extEffectParameter = (b3 & 0x0F);
				}
				patternOffset += 4;
			}
		}
	}
	
	var sampleOffset = patternOffset;
	for (var s = 0; s < this.sampleCount; s++) {
		this.samples[s].startOffset = sampleOffset;
		this.sampleData[s] = new Uint8Array(this.samples[s].length, "uint8");
		var i = 0;
		for (var o = sampleOffset, e = sampleOffset + this.samples[s].length; o < e; o++) {
			this.sampleData[s][i] = mod.charCodeAt(o);
			i++;
		}
		sampleOffset += this.samples[s].length;
	}
	
}

ModFile.prototype = {
  clear: function() {
    delete this.id;
    
    this.title = "";
    this.sampleCount = 31;
    this.samples = [];
    this.sampleData = [];
    for (var i = 0; i < this.sampleCount; i++) {
      this.samples.push({
        length: 0,
        finetune: 0,
        volume: 0,
        repeatOffset: 0,
        repeatLength: 0,
        name: ""
      });
      this.sampleData.push(new Uint8Array(0, "uint8"));
    }
    
    this.positions = [0];
    this.positionCount = this.patternCount = 1;
    this.positionLoopPoint = 0;
    this.identifier = 'M.K.';
    
    this.channelCount = channelCountByIdentifier[this.identifier];
    
    this.patterns = [];
    var pattern = [];
    for (var i = 0; i < 64; i++) {
      pattern[i] = [];
      for (var j = 0; j < this.channelCount; j++)
        pattern[i][j] = {
          sample: 0,
          period: 0,
          effect: 0,
          effectParameter: 0
        };
    }
    this.patterns.push(pattern);
  },

  serialize: function() {
    function padWithNull(s, n) {
      function repeat(s, n) {
        return new Array(n + 1).join(s);
      }
      return s + repeat(String.fromCharCode(0), n - s.length);
    }
    
    function toWord(n) {
      return String.fromCharCode((n >> 8) & 0xFF) + String.fromCharCode(n & 0xFF);
    }

    var buf = padWithNull(this.title, 20);
    for (var i = 0; i < this.sampleCount; i++) {
      var sample = this.samples[i];
      buf += padWithNull(sample.name, 22);
      buf += toWord(sample.length / 2);
      buf += String.fromCharCode(sample.finetune);
      buf += String.fromCharCode(sample.volume);
      buf += toWord(sample.repeatOffset / 2);
      buf += toWord(sample.repeatLength / 2);
    }

    buf += String.fromCharCode(this.positionCount);
    buf += String.fromCharCode(this.positionLoopPoint);
    for (var i = 0; i < 128; i++) {
      buf += String.fromCharCode(this.positions[i]);
    }
    
    buf += this.identifier;

    if (buf.length != 1084)
      console.error("Expected write offset of 1084, got " + buf.length + " instead.");
    
    for (var i = 0; i < this.patternCount; i++)
      for (var j = 0; j < 64; j++)
        for (var k = 0; k < this.channelCount; k++) {
          var data = this.patterns[i][j][k];
          var b0 = (data.sample & 0xF0) | (data.period & 0xF00) >> 8;
          var b1 = data.period & 0xFF;
          var b2 = ((data.sample & 0x0F) << 4) | data.effect;
          var b3 = data.effectParameter;
          buf += String.fromCharCode(b0);
          buf += String.fromCharCode(b1);
          buf += String.fromCharCode(b2);
          buf += String.fromCharCode(b3);
        }

    for (var i = 0; i < this.sampleCount; i++) {
      if (buf.length != this.samples[i].startOffset)
        console.error("Expected sample offset of " + this.samples[i].startOffset +
                      ", got " + buf.length + " instead.");
      for (var j = 0; j < this.sampleData[i].length; j++)
        buf += String.fromCharCode(this.sampleData[i][j]);
    }
    
    return buf;
  }
};
