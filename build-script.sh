#!/bin/bash

if [ "$CF_PAGES_BRANCH" == "main" ]; then
  npm run build -- --configuration production
else
  npm run build -- --configuration development
fi
