use cosmwasm_std::{BankMsg, Coin, CosmosMsg, Env, MessageInfo, Response, StdError, StdResult, Storage};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::{generated::state::{USERS, NATIVE}, helpers::make_payment};

#[derive(Serialize, Debug, Deserialize, Clone, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct User {
    pub kyc_validated: bool,
    pub credits : u64
}

impl User {

    pub fn save(self,  store: &mut dyn Storage, addr: &String) -> StdResult<()> {
        USERS.insert(store, addr, &self)
    }
    pub fn get(store: & dyn Storage, addr: &String) -> StdResult<Self> {
        match USERS.get(store, addr) {
            Some(user) => Ok(user),
            None => Ok(User{ kyc_validated: false, credits: 0 })
        }
    }

    pub fn pay_out (store: &mut dyn Storage, addr: &String, amount: u64) -> StdResult<Response> {

        let mut user = Self::get(store, addr)?;
        
        if amount > user.credits {
            return Err(StdError::generic_err("payout exceeds credit balance"))
        }

        let pay_out_amount = amount as u128 * 1_000_000;
        user.credits -= amount ;
        user.save(store, addr)?;

        let msg = CosmosMsg::Bank(BankMsg::Send {
            to_address: addr.clone(),
            amount: vec![Coin::new(pay_out_amount, "uscrt")],
        });

        Ok(Response::new().add_message(msg))
    }
    
    pub fn pay_in (store: &mut dyn Storage, env: &Env, info: MessageInfo, amount : u64) -> StdResult<Response> {
        let addr = &info.sender.to_string();
        let mut user = Self::get(store, addr)?;
        // make payment
        make_payment(env, &info, amount as u128 * 1_000_000, NATIVE.to_owned())?;
        user.credits += amount;
        user.save(store, addr)?;

        Ok(Response::new())
    }

    pub fn validate(store: &mut dyn Storage, addr: &String,) -> StdResult<Response>{
        let mut user = Self::get(store, addr)?;
        user.kyc_validated = true;
        user.save(store, addr)?;
        Ok(Response::new())
    }
}