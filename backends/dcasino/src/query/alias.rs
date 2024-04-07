use cosmwasm_std::{Deps, StdError, StdResult};
use crate::{generated::state::{ADDR_TO_ALIAS_MNEM, ALIASES}, helpers::try_option};

use super::{querier_is_auth, AliasMnem, AliasOf};

pub fn query_alias_of(deps: Deps, sender_addr: String, _sender_key: String) -> StdResult<AliasOf> {

    // if !querier_is_auth(deps.storage, &sender_addr, &sender_key)
    // {
    //     return Err(StdError::generic_err("Unauthorised.".to_string()));
    // }

    Ok(super::AliasOf {
        alias_of: try_option(ALIASES.get(deps.storage, &sender_addr))?
    })

}

pub fn query_alias_mnem(deps: Deps, sender_addr: String, sender_key: String) -> StdResult<AliasMnem> {

    if !querier_is_auth(deps.storage, &sender_addr, &sender_key)
    {
        return Err(StdError::generic_err("Unauthorised.".to_string()));
    }

    Ok(super::AliasMnem {
        mnem: try_option(ADDR_TO_ALIAS_MNEM.get(deps.storage, &sender_addr))?
    })

}
