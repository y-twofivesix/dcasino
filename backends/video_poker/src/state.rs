type Addr = String;
type ViewingKey = String;

use crate::instance::Instance;
use cosmwasm_std::{StdResult, Storage};
use schemars::JsonSchema;
use secret_toolkit::serialization::Json;
use secret_toolkit::storage::{Keymap, KeymapBuilder, WithoutIter, Item };
use serde::{Deserialize, Serialize};

/******************************************************************************
 Globals
*******************************************************************************/
/// BEGIN AUTOGEN GENESIS_DATA
// pub static GENESIS_SU: &str;
// pub static VALIDATOR_ADDR: &str;
/// END AUTOGEN
/// 
// game instances
pub static INSTANCES: Keymap<Addr, Instance, Json, WithoutIter> =
    KeymapBuilder::new(b"instances").without_iter().build();

// viewing keys
pub static VIEWING_KEYS: Keymap<Addr, ViewingKey, Json, WithoutIter> =
    KeymapBuilder::new(b"viewing_keys").without_iter().build();

pub static SU: Keymap<String, u8,  Json, WithoutIter> = KeymapBuilder::new(b"su").without_iter().build();


pub static CONFIG: Item<Config, Json> = Item::new(b"config");


#[derive(Serialize, Debug, Deserialize, Clone, JsonSchema)]
pub struct Config {
    pub parent_contract: String,
    pub parent_hash: String,
}

impl Config {
    pub fn load(store: & dyn Storage) -> StdResult<Self> {
        CONFIG.load(store)
    }

    pub fn save(self, store: &mut dyn Storage) -> StdResult<()> {
        CONFIG.save(store, &self)
    }
}