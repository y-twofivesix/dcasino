use schemars::JsonSchema;
use serde::{Serialize, Deserialize};
pub mod set_vk;
pub mod credit;
pub mod su;

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    PayIn { amount: u64 },
    PayOut {},
    Validate { },
    SetViewingKey { key: String},
    UpCredit { addr : String, amount : u64 },
    DownCredit { addr : String, amount: u64 },
    AddSu { addr: String},
    RemoveSu { addr: String },
    AddChildContract { name: String, addr : String },
}