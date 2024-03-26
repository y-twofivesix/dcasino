use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub mod deal;
pub mod draw;
pub mod set_vk;
pub mod su;
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
     start / restart a game instance by deailing cards
    *******************************************************************************/
    Deal {
        bet: u8,
        sender_key: String,
        hash: String,
        contract: String
    },

    /******************************************************************************
     execute set ok list
    *******************************************************************************/
    Draw {
        held: Vec<u8>, // cards to hold
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
