use cosmwasm_std::{DepsMut, MessageInfo, Response, StdError, StdResult};

use crate::generated::state::{CHILD_CONTRACTS, SU};

pub fn sudo_add_su(deps: DepsMut, info: MessageInfo, addr: String) -> StdResult<Response> {
    if !SU.contains(deps.storage, &info.sender.to_string()) {
        return Err(StdError::generic_err("Unauthorised".to_string()));
    }

    SU.insert(deps.storage, &addr, &0)?;
    Ok(Response::new())
}

pub fn sudo_remove_su(deps: DepsMut, info: MessageInfo, addr: String) -> StdResult<Response> {
    if !SU.contains(deps.storage, &info.sender.to_string()) {
        return Err(StdError::generic_err("Unauthorised".to_string()));
    }
    if info.sender == addr {
        return Err(StdError::generic_err("Cannot self-remove".to_string()));
    }
    SU.remove(deps.storage, &addr)?;
    Ok(Response::new())
}


pub fn sudo_add_child_contract(deps: DepsMut, info: MessageInfo, name: String, addr: String) -> StdResult<Response> {
    if !SU.contains(deps.storage, &info.sender.to_string()) {
        return Err(StdError::generic_err("Unauthorised".to_string()));
    }

    CHILD_CONTRACTS.insert(deps.storage, &addr, &name)?;
    Ok(Response::new())
}
