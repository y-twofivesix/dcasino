use cosmwasm_std::Storage;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use crate::generated::state::VIEWING_KEYS;

pub mod user;
pub mod alias;

pub fn querier_is_auth(store: &dyn Storage, sender_addr: &String, sender_key: &String) -> bool {
    VIEWING_KEYS.get(store, sender_addr) == Some(sender_key.to_owned())
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    User {
        sender_addr: String,
        sender_key: String
    },
    AliasOf { sender_addr : String, sender_key: String},
    AliasMnem {sender_addr : String, sender_key: String}
}


/******************************************************************************
 alias query obj
*******************************************************************************/
#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct AliasOf {
    pub alias_of: String,
}

/******************************************************************************
 alias query obj
*******************************************************************************/
#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct AliasMnem {
    pub mnem: String,
}