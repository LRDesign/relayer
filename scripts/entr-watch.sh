#!/bin/sh

if type entr; then
  while true; do
    find src test test_support -type f ! -regex '.*\.sw.$' | entr -d gulp testPrep
    sleep 1
  done
else
  echo "entr not installed - try `brew install entr` or see entrproject.org"
  exit 1
fi
