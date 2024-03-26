
use cosmwasm_std::{Deps, StdError, StdResult};

use crate::users::User;

use super::querier_is_auth;


pub fn query_user(
    deps: Deps,
    sender_addr: String,
    sender_key: String,
) -> StdResult<User> {
    
    if !querier_is_auth(deps.storage, &sender_addr, &sender_key) {
        return Err(StdError::generic_err("Unauthorised!"));
    }

    User::get(deps.storage, &sender_addr)
}
