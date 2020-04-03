# Synk Deployment steps Ubunt VM 
## also nginx & certbot

### Required: 

FTP (winscp)
SSH (bash ssh)
GIT
NG CLI
TSC

### Steps:

#### Build
Build API and Client
Now both folder have /dist
client should have environment.prod file edited but can do later w/ linux' sed replace command

#### Prep

ssh into ubuntu vm  and prepare dependencies
install node latest
optionally install pm2

install postgres
create Synk DB and User 
See creds in .env
See /db for more info

open sftp to Ubuntu VM
copy over to /api folder on vm:
api/package.json
api/.env
api/dist/*

copy over to /client folder on vm:
client/dist/synk-client/*

#### Nginx

install nginx
configure /etc/nginx/sites-available/default for SPA app
- disable cache
- route all to index, including args

restart nginx for settings to take effect
nginx -t to test config
reloading conf w/o start also possible 

(TODO also route all api traffic thru there)

#### Run

copy content of /client to /var/www/html (folder of nginx public files) so client can be served by nginx

In /api folder, run npm install
then run node index.js

fix errors if needed - may need to install python and other libs for node-gyp to work (bcrypt dep)

Then in firewall or azure network rules, open 3000 for the api and websockets and ofc 80 for webapp

Dont forget the .env file also has cors settings etc in there! If you encounter network issues..

install certbot for https support
follow steps for your domain


When lost, consult docker files


