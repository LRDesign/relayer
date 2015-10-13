#!/bin/sh -x

if [ -z $TMUX ]; then
  tmux -c scripts/fswatch.sh
  tmux split-window -p 80 karma start
else
  tmux split-window -p 10 scripts/fswatch.sh
  exec karma start
fi
