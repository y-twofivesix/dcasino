use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult
};

use crate::execute::alias::execute_set_alias;
use crate::execute::{self, reclaim, ExecuteMsg};
use crate::generated::state::{Config, CONFIG, GENESIS_SU, SU, USERS};
use crate::instantiate::{InstantiateMsg, MigrateMsg};
use crate::query::alias::{query_alias_mnem, query_alias_of};
use crate::query::{self, QueryMsg};
use crate::users::{self, User};

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
    SU.insert(deps.storage, &GENESIS_SU.to_string(), &0)?;
    CONFIG.save(deps.storage, &Config{
        is_live: true
    })?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    match msg {
        ExecuteMsg::PayIn{ amount } => users::User::pay_in(deps.storage, &env, info, amount),
        ExecuteMsg::PayOut { amount } => users::User::pay_out(deps.storage, &info.sender.to_string(), amount),
        ExecuteMsg::Validate { } => users::User::validate(deps.storage, &info.sender.to_string()),
        ExecuteMsg::SetViewingKey { key } => execute::set_vk::execute_set_vk(deps, env, info, key),
        ExecuteMsg::UpCredit { addr, amount } => execute::credit::execute_up_credit(deps, info, addr, amount),
        ExecuteMsg::DownCredit { addr, amount } => execute::credit::execute_down_credit(deps, info, addr, amount),
        ExecuteMsg::AddSu { addr } => execute::su::sudo_add_su(deps, info, addr),
        ExecuteMsg::RemoveSu { addr } => execute::su::sudo_remove_su(deps, info, addr),
        ExecuteMsg::AddChildContract { name, addr } => execute::su::sudo_add_child_contract(deps, info, name, addr),
        ExecuteMsg::SetAlias { alias, mnem } => execute_set_alias(deps, info, alias, mnem),
        ExecuteMsg::VerifyProof { proof, contract, hash } => reclaim::verify_proof(deps.storage, info, contract, hash, proof)
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::User { sender_addr, sender_key } => to_binary(&query::user::query_user(deps, sender_addr, sender_key)?),
        QueryMsg::AliasOf { sender_addr, sender_key } => to_binary(&query_alias_of(deps, sender_addr, sender_key)?),
        QueryMsg::AliasMnem { sender_addr, sender_key } => to_binary(&query_alias_mnem(deps, sender_addr, sender_key)?)
    }
}

#[cfg(test)]
mod tests {
    
}