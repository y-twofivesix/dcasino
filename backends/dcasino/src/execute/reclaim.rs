#![allow(non_snake_case)]

use cosmwasm_std::{to_binary, MessageInfo, Response, StdResult, Storage, WasmMsg};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::users::User;

use super::ExternalMsg;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ClaimInfo {
    pub provider: String,
    pub parameters: String,
    pub context: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CompleteClaimData {
    pub identifier: String,
    pub owner: String,
    pub epoch: u64,
    pub timestampS: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct SignedClaim {
    pub claim: CompleteClaimData,
    pub signatures: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct Proof {
    pub claimInfo: ClaimInfo,
    pub signedClaim: SignedClaim,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ProofMsg {
    pub proof: Proof,
}

pub fn verify_proof(
    store: &mut dyn Storage,
    info: MessageInfo,
    contract: String,
    hash: String,
    proof: Proof,
) -> StdResult<Response> {

    let sender = info.sender.to_string();
    let mut user = User::get(store, &sender)?;
    user.kyc_validated = true;
    user.save(store, &sender)?;

    let exec_msg = ExternalMsg::VerifyProof{ proof };
    let cosmos_msg = WasmMsg::Execute {
        contract_addr: contract,
        code_hash: hash,
        msg: to_binary(&exec_msg)?,
        funds: vec![],
    };

    Ok(Response::new()
        .add_message(cosmos_msg)
        .add_attribute("action", "verify"))
}