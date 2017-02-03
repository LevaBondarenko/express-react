#!/bin/bash
cd "/var/hosting/w.etagi.com/www/wp-content/themes/sage-master/test/e2e"
DATE=$(date +%d.%m.%Y)
TIME=$(date +%H:%M)

mkdir Report/Daily
echo "Subject: Daily test report ($DATE)" > Report/Daily/"$DATE"-"$TIME".txt
node_modules/protractor/bin/protractor bs.protractor.conf.js --params.domain com --suite citySelector --capabilities.project "etagi.com [daily]" --capabilities.build "$DATE" --capabilities.name "$TIME [citySelector]" --params.showCities 1 | tee -a Report/Daily/"$DATE"-"$TIME".txt
#sendmail e.v.schukina@kor4.etagi.com < test/e2e/Report/Opening/"$DATE"-"$TIME".txt
