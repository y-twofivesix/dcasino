use cosmwasm_std::Storage;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use crate::generated::state::VIEWING_KEYS;

pub mod user;

pub fn querier_is_auth(store: &dyn Storage, sender_addr: &String, sender_key: &str) -> bool {
    VIEWING_KEYS.get(store, sender_addr) == Some(sender_key.to_owned())
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    User {
        sender_addr: String,
        sender_key: String
    }
}