#!/bin/bash
cd "/var/hosting/w.etagi.com/www/wp-content/themes/sage-master/test/e2e/"

mkdir Report/Tickets

case $1 in
  1) START="0"
     END="24";;
  2) START="24"
     END="44";;
  3) START="44"
     END="57";;
  4) START="57"
     END="64";;
  5) START="64"
     END="72";;
  *) START="0"
     END="72";;
esac

  item=$START
  while [ $item -lt $END ]
  do
    item=$(($item+1));
    echo $item
    DATE=$(date +%d.%m.%Y)
    TIME=$(date +%H:%M)
    echo "Subject: Tickets test report ($DATE - $1)" >  Report/Tickets/"$DATE"_"$TIME"_"$1".txt
    node_modules/protractor/bin/protractor bs.protractor.conf.js --params.item $item --params.domain com --suite tickets --capabilities.name " $TIME [$item]"  --capabilities.project "etagi.com [tickets]" --params.cities "all" --capabilities.build "$DATE" $2 | tee -a Report/Tickets/"$DATE"_"$TIME"_"$1".txt
  done
