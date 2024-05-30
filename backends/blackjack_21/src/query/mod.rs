pub mod instance_state;
pub mod alias;
use cosmwasm_std::{QuerierWrapper, StdResult, Storage, Timestamp};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::{generated::state::Config, instance::Outcome};


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
pub struct AliasMnem {
    pub mnem: String,
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
    pub dealer: Vec<u8>,
    pub bet: u8,
    pub dealt: bool,
    pub last_win: u64,
    pub outcome: Outcome,
    pub timestamp: Timestamp,
    pub credits: u64
}

pub fn contract_query_user(
    store: & dyn Storage,
    querier: &QuerierWrapper, 
    sender_addr: String, 
    sender_key: String)->
StdResult<User> {

    let config = Config::load(store)?;
    querier.query_wasm_smart::<User>(
        config.parent_hash, 
        config.parent_contract, 
        &ParentQueryMsg::User { sender_key, sender_addr }
    )
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
enum ParentQueryMsg {
    User {
    sender_addr: String,
    sender_key: String,
    },
   AliasOf { 
    sender_addr : String,
    sender_key: String,
    },
   AliasMnem {
    sender_addr: String,
    sender_key: String,
    },

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
    },

}
