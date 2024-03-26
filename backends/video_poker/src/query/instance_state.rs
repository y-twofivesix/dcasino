
use cosmwasm_std::{Deps, StdResult};

use crate::{helpers::try_option, generated::state::INSTANCES};

use super::contract_query_user;


pub fn query_instance_state(
    deps: Deps,
    sender_addr: String,
    sender_key: String,
    hash: String,
    contract: String,
) -> StdResult<super::InstanceState> {
    
    let user = contract_query_user(
        &deps.querier, 
        &sender_addr, 
        &sender_key,
        &hash,
        &contract)?;

    let inst = try_option(INSTANCES.get(deps.storage, &sender_addr))?;

    Ok(super::InstanceState { 
        hand: inst.hand, 
        bet: inst.bet, 
        dealt: inst.dealt,
        last_outcome: inst.last_outcome,
        last_win: inst.last_win,
        timestamp: inst.timestamp,
        credits: user.credits
    })
}