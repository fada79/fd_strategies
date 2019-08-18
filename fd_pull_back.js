var _ = require('lodash');
var log = require('../core/log.js');

var strat = {};



strat.init = function() {
        this.name = "pull back with or without trend";
        this.stopLoss = 0;
        this.highClose = 0;
        this.lowClose = 0;
        this.advised = 0; // 1 => long advised; -1 => short advised

        this.requiredHistory = this.settings.ltLongPeriod;
        this.addTalibIndicator('stShort', 'ema', { optInTimePeriod: this.settings.stShortPeriod });
        this.addTalibIndicator('stLong', 'ema', { optInTimePeriod: this.settings.stLongPeriod });
        this.addTalibIndicator('ltShort', 'ema', { optInTimePeriod: this.settings.ltShortPeriod });
        this.addTalibIndicator('ltLong', 'ema', { optInTimePeriod: this.settings.ltLongPeriod });
        this.addTalibIndicator('tsAtr', 'atr', { optInTimePeriod: this.settings.tsAtrPeriod });
        
}

strat.update = function(candle) {
}

strat.log = function() {
}

strat.check = function(candle) {
        const stShort = this.talibIndicators.stShort.result.outReal;
        const stLong = this.talibIndicators.stLong.result.outReal;
        const ltShort = this.talibIndicators.stShort.result.outReal;
        const ltLong = this.talibIndicators.ltLong.result.outReal;
        const tsAtr = this.talibIndicators.tsAtr.result.outReal;

        const ltUptrend = ltShort > ltLong;
        const ltDowntrend = ! ltUptrend;
        const stUptrend = stShort > stLong;
        const stDowntrend = ! stUptrend;

        ///////ENTRIES////////
        if ( ltUptrend && stDowntrend) {
                this.advice('long');
                this.advised = 1;
                this.highClose = candle.close;
        } else if ( ltDowntrend && stUptrend) {
                this.advice('short');
                this.advised = -1;
                this.lowClose = candle.close;
        }
        ////END OF ENTRIES////
        
        
        ////////EXITS////////
        if ( this.advised == 1 ) {  
                if ( candle.close > this.highClose ) {
                        this.highClose = candle.close;
                }
                this.stopLoss = this.highClose - this.settings.nbAtrStop * tsAtr;
                if (candle.close <= this.stopLoss) {
                        this.advice('short');
                        this.advised = 0;
                        this.stopLoss = 0;
                }
       } else if (this.advised == -1) {
                if ( candle.close < this.lowClose ) {
                        this.lowClose = candle.close;
                }
                this.stopLoss = this.lowClose + this.settings.nbAtrStop * tsAtr;
                if (candle.close >= this.stopLoss) {
                        this.advice('long');
                        this.advised = 0;
                        this.stopLoss = 0;
                }
       }

}

strat.end = function() {
}

module.exports = strat;
