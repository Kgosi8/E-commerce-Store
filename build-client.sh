#!/bin/bash
set -e                              # stop immediately if anything fails

rm -rf frontend/dist                # no stale build can sneak through
cd frontend
ng build
cd ..

rm -rf backend/public
mkdir backend/public
cp -r frontend/dist/*/browser/. backend/public/

echo "Done. Contents of backend/public:"
ls backend/public