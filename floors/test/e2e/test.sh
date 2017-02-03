#!/bin/bash
cd "/var/hosting/w.etagi.com/www/wp-content/themes/sage-master/"

case $1 in
  0) CITIES="www";;
  1) CITIES="www ishim n-urengoy omsk perm surgut tobolsk yalutorovsk";;
  2) CITIES="anapa astana astrakhan vlg vologda gk ekb irk kazan kaliningrad kem krasnodar kras lipetsk miass msk murom chelny ugansk tagil nk novosibirsk norilsk orel samara saratov sterlitamak tomsk tula ulan-ude ufa khm chel shadrinsk sakhalin";;
  3) CITIES="www ishim n-urengoy omsk perm surgut tobolsk yalutorovsk anapa astana astrakhan vlg vologda gk ekb irk kazan kaliningrad kem krasnodar kras lipetsk miass msk murom chelny ugansk tagil nk novosibirsk norilsk orel samara saratov sterlitamak tomsk tula ulan-ude ufa khm chel shadrinsk sakhalin";;
  *) CITIES=$1;;
esac

mkdir test/e2e/Report/$2
echo "$2" > test/e2e/Report/$2/$2.txt

for city in $CITIES
do
    echo "$city" >  test/e2e/Report/$2/$city.txt
    protractor test/e2e/bs.protractor.conf.js --params.domain com --suite tickets --capabilities.name $city  --capabilities.project "etagi.com [tickets]" --params.cities $city --capabilities.build $2 $6 | tee -a test/e2e/Report/$2/$2.txt test/e2e/Report/$2/$city.txt
done