#!/bin/bash
PLUGIN_DIR=${PWD}
PLUGIN_NAME=${PWD##*/}
npm unlink react-bootstrap
npm unlink react
npm unlink hadron-app
cd ${COMPASS_HOME}/node_modules/react-bootstrap
npm unlink
# Not sure if this works, at this point it's usually easier to just
# `rm -r node_modules` in plugin and Compass, and reinstall both :/
npm unlink ../react
cd ${COMPASS_HOME}/node_modules/react
npm unlink
cd ${COMPASS_HOME}/node_modules/hadron-app
npm unlink
cd ${COMPASS_HOME}
npm unlink @mongodb-js/${PLUGIN_NAME}
cd ${PLUGIN_DIR}
npm unlink
