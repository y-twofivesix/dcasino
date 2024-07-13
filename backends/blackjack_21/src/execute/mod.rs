use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub mod deal;
pub mod hit_or_stand;
pub mod set_vk;
pub mod su;
pub mod insurance;

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ContractMsg {
    UpCredit { addr : String, amount : u64 },
    DownCredit { addr : String, amount: u64 },
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {

    /******************************************************************************
     start / restart a game instance by dealing cards
    *******************************************************************************/
    Deal {
        bet: u8,
        sender_key: String,
        as_alias: bool
    },

    /******************************************************************************
     start / restart a game instance by dealing cards
    *******************************************************************************/
    Insurance {
        sender_key: String,
        as_alias: bool
    },

    /******************************************************************************
     execute set ok list
    *******************************************************************************/
    Hit {
        sender_key: String,
        as_alias: bool
    },

    /******************************************************************************
     execute set ok list
    *******************************************************************************/
    Stand {
        sender_key: String,
        as_alias: bool,
        double_down: bool
    },

    /******************************************************************************
     execute set viewing key
    *******************************************************************************/
    SetViewingKey {
        key: String,
    },

        /******************************************************************************
     execute set viewing key
    *******************************************************************************/
    SetParentContract {
        hash: String,
        addr: String
    },

    AddSu { addr: String},
    RemoveSu { addr: String },

}
