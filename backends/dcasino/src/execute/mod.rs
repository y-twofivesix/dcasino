use schemars::JsonSchema;
use serde::{Serialize, Deserialize};

use self::reclaim::Proof;
pub mod set_vk;
pub mod credit;
pub mod su;
pub mod alias;
pub mod reclaim;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    PayIn { amount: u64 },
    PayOut { amount: u64 },
    Validate { },
    SetViewingKey { key: String},
    UpCredit { addr : String, amount : u64 },
    DownCredit { addr : String, amount: u64 },
    AddSu { addr: String},
    RemoveSu { addr: String },
    AddChildContract { name: String, addr : String },
    SetAlias { alias: String, mnem: String},
    VerifyProof{ proof: Proof, contract: String, hash: String},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExternalMsg {
    VerifyProof{ proof: Proof},
}