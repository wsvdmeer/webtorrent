## FAQ
If you get the message : WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED
ssh-keygen -R "you server hostname or ip"

## Setup Raspberry Pi
Install Raspberry PI Imager : https://www.raspberrypi.org/software/
Install Raspberry PI OS LITE (32-BIT) on SD CARD

Create ssh file (whitout file extension) and add it to the root folder of SD Card
https://www.raspberrypi.org/documentation/remote-access/ssh/

Login to raspberry pi with ssh pi@ipaddress
Change password with passwd

## Update rpi
sudo apt update
sudo apt full-upgrade

## Setup static ip
sudo nano /etc/dhcpcd.conf

Change hostname
sudo nano /etc/hostname

## Setup VPN
https://www.raspberrypi-spy.co.uk/2020/06/raspberry-pi-vpn-setup-guide/

sudo apt install openvpn
cd /etc/openvpn/

sudo wget https://www.privateinternetaccess.com/openvpn/openvpn.zip
sudo unzip openvpn.zip

List servers : ls *.ovpn -l
Check ip : curl https://api.ipify.org

create auth file : sudo nano auth.txt
add username and password to this file (username and password underneath eachother)

All ovpn configuration files can be updated to use this text file. The following command will update all the ovpn files in the current directory:
sudo find *.ovpn -type f -exec sed -i 's/auth-user-pass/auth-user-pass auth.txt/g' {} \;

Autostart OpenVPN on Pi Boot

sudo cp Sweden.ovpn autostart.conf
sudo nano /etc/default/openvpn


## Setup NODE + NPM
https://dev.to/bogdaaamn/run-your-nodejs-application-on-a-headless-raspberry-pi-4jnn

curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
sudo apt-get install -y nodejs

node --version
npm --version

## Setup GIT
sudo apt-get install git


Seedbox
https://github.com/sebgl/htpc-download-box
https://github.com/ghostserverd/mediaserver-docker#about

