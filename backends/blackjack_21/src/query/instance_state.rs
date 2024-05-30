
use cosmwasm_std::{QuerierWrapper, StdResult, Storage, Timestamp};

use crate::{generated::state::INSTANCES, instance::Outcome};

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

    match INSTANCES.get(store, &sender_addr) {
        Some(inst) => {
            Ok(super::InstanceState { 
                hand: inst.hand, 
                dealer: inst.dealer, 
                bet: inst.bet, 
                dealt: inst.dealt,
                outcome: inst.outcome,
                last_win: inst.last_win,
                timestamp: inst.timestamp,
                credits: user.credits
            })
        }
        None => {
            Ok(super::InstanceState { 
                hand: vec![],
                dealer: vec![],
                outcome: Outcome::Undefined,
                bet: 0, 
                dealt: false,
                last_win: 0,
                timestamp: Timestamp::from_seconds(0),
                credits: user.credits
            })
        }
    }
    
}