var _ = require('lodash');
var log = require('../core/log.js');

var method = {};

method.resetTrade = function() {
	this.trade = {
		direction: 'none', // ['none', 'long', 'short']
		advised: false,
		entryPrice: 0,
		exitPrice: 0,
                entrySignalPersist: 0,
                exitSignalPersist: 0
	}
}

method.init = function() {
	this.name = 'FD 4 EMA Strategy';
	this.requiredHistory = this.settings.thresholds.historySize;
	this.resetTrade();
	
	this.trades = [];
	this.addTalibIndicator('blueEMA',   
		'ema', 
		{optInTimePeriod : this.settings.EmaPeriods.blue});
	this.addTalibIndicator('greenEMA',  
		'ema', 
		{optInTimePeriod : this.settings.EmaPeriods.green});
	this.addTalibIndicator('yellowEMA', 
		'ema', 
		{optInTimePeriod : this.settings.EmaPeriods.yellow});
	this.addTalibIndicator('redEMA',    
		'ema', 
		{optInTimePeriod : this.settings.EmaPeriods.red});

}

method.update = function() {}

method.log = function() {}

method.checkIndicators = function() {
	this.blueEMA = this.talibIndicators.blueEMA.result.outReal;
	this.greenEMA = this.talibIndicators.greenEMA.result.outReal;
	this.yellowEMA = this.talibIndicators.yellowEMA.result.outReal;
	this.redEMA = this.talibIndicators.redEMA.result.outReal;
	this.dEmaPct = (this.blueEMA - this.redEMA)/this.candle.close * 100;
	//console.log("dEmaPct => " + this.dEmaPct);
}

method.checkLongEntry = function() {
	if ( this.blueEMA > this.greenEMA && 
			this.greenEMA > this.yellowEMA && 
                        this.yellowEMA > this.redEMA && 
			!this.trade.advised && 
			this.trade.direction != 'short' ) {
                if ( this.trade.entrySignalPersist >= 
					this.settings.thresholds.entrySignalPersist ) {
		        this.advice('long');
		        this.trade.advised = true;
			this.trade.direction = 'long';
		        this.trade.entryPrice = this.candle.close;
                } else {
                        this.trade.entrySignalPersist++;
			this.trade.direction = 'long';
                }
	} else if (!this.trade.advised) {
                this.trade.entrySignalPersist = 0;
        }
}

method.checkShortEntry = function() {
	if ( this.blueEMA < this.greenEMA && 
			this.greenEMA < this.yellowEMA && 
                        this.yellowEMA < this.redEMA && 
			!this.trade.advised &&
			this.trade.direction != 'long' ) {
                if ( this.trade.entrySignalPersist >= 
					this.settings.thresholds.entrySignalPersist ) {
		        this.advice('short');
		        this.trade.advised = true;
			this.trade.direction = 'short';
		        this.trade.entryPrice = this.candle.close;
                } else {
                        this.trade.entrySignalPersist++;
			this.trade.direction = 'short';
                }
	} else if (!this.trade.advised) {
                this.trade.entrySignalPersist = 0;
        }
}

method.checkLongExit = function() {
	//if ( this.yellowEMA < this.redEMA && this.trade.advised) {
	if ( this.dEmaPct > this.settings.thresholds.dEmaPct && 
			this.trade.advised &&
			this.trade.direction == 'long' ) {
                if ( this.trade.exitSignalPersist >= 
				this.settings.thresholds.exitSignalPersist ) {
		        this.advice('short');
		        this.trade.exitPrice = this.candle.close;
		        this.trades.push(this.trade);
		        this.resetTrade();
                } else {
                        this.trade.exitSignalPersist++;
                } 
	} else if (this.trade.advised) {
                this.trade.exitSignalPersist = 0;
        }
}

method.checkShortExit = function() {
	//if ( this.yellowEMA > this.redEMA && this.trade.advised) {
	if ( this.dEmaPct < -this.settings.thresholds.dEmaPct && 
			this.trade.advised && 
			this.trade.direction == 'short' ) {
                if ( this.trade.exitSignalPersist >= 
				this.settings.thresholds.exitSignalPersist ) {
		        this.advice('long');
		        this.trade.exitPrice = this.candle.close;
		        this.trades.push(this.trade);
		        this.resetTrade();
                } else {
                        this.trade.exitSignalPersist++;
                } 
	} else if (this.trade.advised) {
                this.trade.exitSignalPersist = 0;
        }
}

method.checkLongStopLoss = function() {
	if ( this.candle.close <= this.trade.entryPrice * 
			(1 - this.settings.thresholds.stopLossPct / 100) &&
			this.trade.advised && 
			this.trade.direction == 'long' ) {
		this.advice('short');
		this.trade.exitPrice = this.candle.close;
		this.trades.push(this.trade);
		this.resetTrade();
	}
}

method.checkShortStopLoss = function() {
	if ( this.candle.close >= this.trade.entryPrice * 
			(1 + this.settings.thresholds.stopLossPct / 100) &&
			this.trade.advised && 
			this.trade.direction == 'short' ) {
		//close the long trade
		this.advice('long');
		this.trade.exitPrice = this.candle.close;
		this.trades.push(this.trade);
		this.resetTrade();
	}
}

method.check = function() {
	this.checkIndicators();

//////////////////////////////////////////////////
///////////// LONG POSITION //////////////////////
///////////// SHORT POSITION /////////////////////

	//
	// Long entry
	// Short entry
	//
	this.checkLongEntry();
	this.checkShortEntry();

	//
	// Long Exit
	// Short Exit
	//
	this.checkLongExit();
	this.checkShortExit();

	//
	// Long Stop Loss
	// Short Stop Loss
	//
	this.checkLongStopLoss();
	this.checkShortStopLoss();

/////////////END OF LONG POSITION ////////////////
///////////// END OF SHORT POSITION //////////////
//////////////////////////////////////////////////
	
//////////////////////////////////////////////////
///////////// SHORT POSITION /////////////////////
	
	//
	//

	//
	//

	//
	//
	
//////////////////////////////////////////////////
}

method.end = function() {
	console.log(">>>>>>>>>>>TRADES>>>>>>>>>>>>>>>>>>>\n" + JSON.stringify(this.trades));

}

module.exports = method;
