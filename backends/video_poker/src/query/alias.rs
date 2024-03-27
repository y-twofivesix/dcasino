use cosmwasm_std::{QuerierWrapper, StdResult, Storage};

use crate::generated::state::Config;

use super::{AliasMnem, AliasOf, ParentQueryMsg};


pub fn query_alias_of(
    store:  & dyn Storage, 
    querier: &QuerierWrapper, 
    sender_addr: String,
    sender_key: String) -> StdResult<AliasOf> {
    
    let config = Config::load(store)?;
    querier.query_wasm_smart::<AliasOf>(
        config.parent_hash, 
        config.parent_contract, 
        &ParentQueryMsg::AliasOf { sender_addr, sender_key })

}

pub fn query_alias_mnem(
    store:  & dyn Storage, 
    querier: &QuerierWrapper, 
    sender_addr: String, 
    sender_key: String,
) -> StdResult<AliasMnem> {

    let config = Config::load(store)?;
    querier.query_wasm_smart::<AliasMnem>(
        config.parent_hash, 
        config.parent_contract, 
        &ParentQueryMsg::AliasMnem { sender_addr, sender_key })
}
