use crate::generated::state::{SU, Config};
use cosmwasm_std::{DepsMut, MessageInfo, Response, StdError, StdResult};

pub fn sudo_set_parent_contract(deps: DepsMut, info: MessageInfo, hash: String, addr: String) -> StdResult<Response> {
    if !SU.contains(deps.storage, &info.sender.to_string()) {
        return Err(StdError::generic_err("Unauthorised".to_string()));
    }
    let mut config = Config::load(deps.storage)?;
    config.parent_hash = hash;
    config.parent_contract = addr;
    config.save(deps.storage)?;
    Ok(Response::new())
}

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