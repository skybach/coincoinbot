# coincoinbot

cd ssl/

openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -sha256 -req -days 365 -in csr.pem -signkey key.pem -out server.crt

