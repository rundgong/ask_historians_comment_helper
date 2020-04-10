#!/bin/bash

cd browser_extension
zip -r -FS ../ask_historians_firefox.zip *
cd ..
cp ask_historians_firefox.zip ask_historians_firefox.xpi
