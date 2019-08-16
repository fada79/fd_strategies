var _ = require('lodash');
var log = require('../core/log.js');

var strat = {};

strat.init = function() {
	this.name = 'Big Fund';
	this.advised = 0;
	this.lowClose = 0;
	this.highClose = 0;
	this.requiredHistory = this.settings.longSmaPeriod;

	this.addTalibIndicator('minMax', 'minmax', { optInTimePeriod: this.settings.minMaxPeriod });
	this.addTalibIndicator('kdAtr', 'atr', { optInTimePeriod: this.settings.atrPeriod });
	this.addTalibIndicator('shortSma', 'sma', { optInTimePeriod: this.settings.shortSmaPeriod });
	this.addTalibIndicator('longSma', 'sma', { optInTimePeriod: this.settings.longSmaPeriod });
}


strat.update = function(candle) {
}

strat.log = function() {
}

strat.check = function(candle) {
	const kdAtr = this.talibIndicators.kdAtr.result.outReal;
	const shortSma = this.talibIndicators.shortSma.result.outReal;
	const longSma = this.talibIndicators.longSma.result.outReal;
	const min = this.talibIndicators.minMax.result.outMin;
	const max = this.talibIndicators.minMax.result.outMax;

	//ENTRIES
	if ( shortSma > longSma && candle.close >= max ) { ///// LONG ENTRIES
		//positions are long only
		//is there a breakout? 
		this.advice('long');
		this.advised = 1;
		this.highClose = candle.close;
	} else if ( shortSma < longSma && candle.close <= min ) { ///// SHORT ENTRIES
		//positions are short only
		//is there a breakout? 
		this.advice('short');
		this.advised = -1;
		this.lowClose = candle.close;
	} else if ( this.advised == 1 ) { ///// LONG POSITION OPENED 
		if ( candle.close <= this.highClose - this.settings.nbAtrTls * kdAtr ) { ///// LONG EXITS
			this.advice('short');
			this.advised = 0;
		}
		if ( this.highClose < candle.close ) { ///// UPDATE LONG TRAILING STOP 
			this.highClose = candle.close;
		}
	} else if ( this.advised == -1 ) { ///// SHORT POSITION OPENED
		if ( candle.close >= this.lowClose + this.settings.nbAtrTls * kdAtr ) { ///// SHORT EXITS
			this.advice('long');
			this.advised = 0;
		}
		if (this.lowClose > candle.close) { ///// UPDATE SHORT TRAILING STOP
			this.lowClose = candle.close;
		}
	}
}

strat.end = function() {
}

module.exports = strat;
