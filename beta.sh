#!/bin/sh

tarifa build android stage
tarifa hockeyapp version upload android stage -V
