#!/bin/sh

if type entr; then
  while sleep 0.1; do
    find src test test_support -type f ! -regex '.*\.sw.$' | entr -d gulp testPrep
  done
else
  echo "entr not installed - try `brew install entr` or see entrproject.org"
  exit 1
fi
