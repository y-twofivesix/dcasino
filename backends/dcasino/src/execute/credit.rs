use cosmwasm_std::{DepsMut, MessageInfo, Response, StdError, StdResult};
use crate::users::User;
use crate::generated::state::CHILD_CONTRACTS;

pub fn execute_up_credit(
    deps: DepsMut,
    info: MessageInfo,
    addr: String,
    amount: u64,
) -> StdResult<Response> {

    if !CHILD_CONTRACTS.contains(deps.storage, &info.sender.to_string()) {
        return Err(StdError::generic_err(format!("unrecognised contract address {addr}")))
    }

    let mut user  = User::get(deps.storage, &addr)?;
    user.credits += amount;
    user.save(deps.storage, &addr)?;
    Ok(Response::new())
}


pub fn execute_down_credit(
    deps: DepsMut,
    info: MessageInfo,
    addr: String,
    amount: u64,
) -> StdResult<Response> {

    if !CHILD_CONTRACTS.contains(deps.storage, &info.sender.to_string()) {
        return Err(StdError::generic_err(format!("unrecognised contract address {addr}")))
    }

    let mut user  = User::get(deps.storage, &addr)?;
    if amount> user.credits {
        return Err(StdError::generic_err(format!("Insufficient credits")))
    }
    user.credits -= amount;
    user.save(deps.storage, &addr)?;
    Ok(Response::new())
}