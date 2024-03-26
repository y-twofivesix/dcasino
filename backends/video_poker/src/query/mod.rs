pub mod instance_state;
use cosmwasm_std::{QuerierWrapper, StdResult, Storage, Timestamp};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::generated::state::VIEWING_KEYS;


/******************************************************************************
 alias query obj
*******************************************************************************/
#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct AliasOf {
    pub alias_of: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct User {
    pub kyc_validated: bool,
    pub credits : u64
}
/******************************************************************************
 instance query obj
*******************************************************************************/
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct InstanceState {
    pub hand: Vec<u8>,
    pub bet: u8,
    pub dealt: bool,
    pub last_outcome: String,
    pub last_win: u64,
    pub timestamp: Timestamp,
    pub credits: u64
}

pub fn contract_query_user(
    querier: &QuerierWrapper, 
    sender_addr: &String, 
    sender_key: &String,
    hash: &String,
    contract: &String)->
StdResult<User> {
    querier.query_wasm_smart::<User>(
        hash, 
        contract, 
        &QueryMsg::User { sender_key: sender_key.clone(), sender_addr: sender_addr.clone() }
    )
}

pub fn querier_is_auth(store: &dyn Storage, sender_addr: &String, sender_key: &String) -> bool {
    // TODO query dcasino smart contract viewing keys
    VIEWING_KEYS.get(store, sender_addr) == Some(sender_key.to_owned())
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {

    /******************************************************************************
     instance state info
    *******************************************************************************/
    InstanceState{
        sender_addr: String,
        sender_key: String,
        hash: String,
        contract: String
    },

    User {
        sender_addr: String,
        sender_key: String,
    }
}
