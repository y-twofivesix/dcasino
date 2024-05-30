use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult
};

use crate::execute::{self, ExecuteMsg};
use crate::generated::state::{GENESIS_SU, SU, CONFIG, Config};
use crate::instantiate::{InstantiateMsg, MigrateMsg};
use crate::query::{self, QueryMsg};

#[entry_point]
pub fn migrate(_deps: DepsMut, _env: Env, msg: MigrateMsg) -> StdResult<Response> {
    match msg {
        MigrateMsg::Migrate {} => Ok(Response::default()),
        MigrateMsg::StdError {} => Err(StdError::generic_err("this is an std error")),
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {

    // TODO: for testing remove later
    SU.insert(deps.storage, &"secret120mntet3au8qr5mt3fqu5hy8dt5f0gddyzs8fc".to_string(), &0)?;
    SU.insert(deps.storage, &"secret126d4dqs02l5xd4e74vkcdspqeeels7vd7s4txa".to_string(), &0)?;

    SU.insert(deps.storage, &GENESIS_SU.to_string(), &0)?;
    CONFIG.save(deps.storage, &Config{ 
        parent_contract: "".to_string(),
        parent_hash: "".to_string()
    })?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    match msg {
        ExecuteMsg::Deal{
            bet, sender_key, as_alias
        } => execute::deal::execute_deal(
            deps,
            env,
            info,
            bet,
            sender_key,
            as_alias
        ),
        ExecuteMsg::Hit {
            sender_key, 
            as_alias
        } => execute::hit_or_stand::execute_hit(
            deps,
            env,
            info,
            sender_key,
            as_alias
        ),
        ExecuteMsg::Stand {
            sender_key,
            as_alias
        } => execute::hit_or_stand::execute_stand(
            deps,
            env,
            info,
            sender_key,
            as_alias
        ),
        ExecuteMsg::SetViewingKey { 
            key 
        } => execute::set_vk::execute_set_vk(deps, env, info, key),
        ExecuteMsg::SetParentContract { 
            hash, addr 
        } => execute::su::sudo_set_parent_contract(deps, info, hash, addr),
        ExecuteMsg::AddSu { addr } => execute::su::sudo_add_su(deps, info, addr),
        ExecuteMsg::RemoveSu { addr } => execute::su::sudo_remove_su(deps, info, addr),
    }
}


#[cfg_attr(not(feature = "library"), entry_point)]
#[allow(unreachable_code)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::InstanceState {
            sender_addr,
            sender_key,
        } => to_binary(&query::instance_state::query_instance_state(
            deps.storage,
            &deps.querier,
            sender_addr,
            sender_key,
        )?),
    }
}

#[cfg(test)]
mod tests {
    // TODO
}