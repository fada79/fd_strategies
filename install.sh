#!/bin/sh

GEKKO_BASE=../gekko3
GEKKO_STRAT=$GEKKO_BASE/strategies
GEKKO_CONFIG_STRAT=$GEKKO_BASE/config/strategies

cp -b *.js $GEKKO_STRAT
cp -b *.toml $GEKKO_CONFIG_STRAT
