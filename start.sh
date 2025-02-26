#!/bin/sh
cd /proxy && node proxy-server.js &
nginx -g 'daemon off;' 