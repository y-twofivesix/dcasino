use schemars::JsonSchema;
use serde::{Deserialize, Serialize};


#[derive(Serialize, Debug, Deserialize, Clone, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct User {
    pub kyc_validated: bool,
    pub credits : u64
}
