
use cosmwasm_std::{QuerierWrapper, StdResult, Storage};

use crate::{helpers::try_option, generated::state::INSTANCES};

use super::contract_query_user;


pub fn query_instance_state(
    store: & dyn Storage,
    querier: & QuerierWrapper,
    sender_addr: String,
    sender_key: String
) -> StdResult<super::InstanceState> {
    
    let user = contract_query_user(
        store,
        querier, 
        sender_addr.clone(), 
        sender_key)?;

    let inst = try_option(INSTANCES.get(store, &sender_addr))?;

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