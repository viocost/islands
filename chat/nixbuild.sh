#!/bin/bash
clear
echo welcome to islands istall script!
echo Please enter the path to folder for islands storage: 

read path

if ! [ -d $HOME/$path ] ; then
	echo Directory "$path" does not exist. Create one? Y/n
    read create
    if  echo $create | grep -iqF y; then
	echo creating $path
        mkdir $HOME/$path
    else
       	    echo exiting...		
	    exit 0
    fi
fi


docker build -f Dockerfile -t islands:chat .

echo would you like to run your island now? Y/n
read runnow
if echo $runnow | grep -iqF y; then 
	docker run --rm -it -p 80:4000 -p 9229:9229 --mount type=bind,source=$HOME/$path,target=/islandsData islands:chat
fi

