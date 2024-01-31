#!/bin/bash

if [ -f .env ]; then
    source .env
else
    echo "missing .env file"
    return 1
fi

alias query='secretcli query compute query $DEV_CONTRACT_ADDRESS'
alias execute='secretcli tx compute execute $DEV_CONTRACT_ADDRESS'
alias qcomp='secretcli q compute tx'
alias qhash='secretcli q tx'

setvk() {
    yes | execute "{\"set_viewing_key\" : {\"key\" : \"$1\"} }" --from $2
}


qinst () {
    query "{\"instance_state\": { \"sender_addr\": \"$DEV_GEN_SU\", \"sender_key\": \"$DEV_VK\" } }"
}