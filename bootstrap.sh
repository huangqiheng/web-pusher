/bin/sh -e

mkdir -p ~/bin ~/tmp

sudo apt-get install -y curl
sudo apt-get install -y git 
sudo apt-get install -y ruby
sudo gem install rake
curl -L https://get.rvm.io | bash -s stable --ruby

# add to .profile
#[[ -s "/usr/local/rvm/scripts/rvm" ]] && source "/usr/local/rvm/scripts/rvm"

