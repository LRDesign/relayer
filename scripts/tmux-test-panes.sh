#!/bin/sh -x

tmux split-window -p 10 scripts/entr-watch.sh
tmux split-window -p 80 karma start
