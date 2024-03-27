use cosmwasm_std::{DepsMut, MessageInfo, Response, StdResult};
use crate::generated::state::{ADDR_TO_ALIAS_MNEM, ALIASES};

pub fn execute_set_alias(deps: DepsMut, info: MessageInfo, alias: String, mnem : String) -> StdResult<Response> {
    ALIASES.insert(deps.storage, &alias, &info.sender.to_string())?;
    ADDR_TO_ALIAS_MNEM.insert(deps.storage, &info.sender.to_string(), &mnem)?;
    Ok(Response::new().add_attribute("action", "set alias"))
}
