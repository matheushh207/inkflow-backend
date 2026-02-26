#!/bin/bash
# Workaround: Render configuration
# This script ensures npm can find package.json in the root directory
cd /opt/render/project
npm install
npm run build
