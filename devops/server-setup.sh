sudo apt update
sudo apt install nginx
sudo apt install certbot
sudo apt install python3-certbot-nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# install postgresql

# Import the repository signing key:
sudo apt install curl ca-certificates
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.p
ostgresql.org/media/keys/ACCC4CF8.asc

sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc]
 https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources
.list.d/pgdg.list'

sudo apt -y install postgresql-16

# install node

curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt install -y nodejs

# install python

sudo apt install python3-venv
