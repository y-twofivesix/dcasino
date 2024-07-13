use cosmwasm_std::{to_binary, DepsMut, Env, MessageInfo, Response, StdError, StdResult, WasmMsg};

use crate::{generated::state::{CONFIG, INSTANCES}, helpers::{translate_card, try_option}, query::{alias::query_alias_of, contract_query_user}};

use super::ContractMsg;


    // Ask contract to deal 4 cards to player
pub fn execute_insurance( deps : DepsMut,
    env : Env,
    info : MessageInfo,
    sender_key: String, 
    as_alias: bool) -> StdResult<Response> {

        let sender_addr = match as_alias {
            false => info.sender.to_string(),
            true => query_alias_of(deps.storage, &deps.querier, info.sender.to_string(), sender_key.clone())?.alias_of
        };
    
        let user = contract_query_user(
            deps.storage,
            &deps.querier, 
            sender_addr.clone(), 
            sender_key)?;

        let mut inst = try_option(INSTANCES.get(deps.storage, &sender_addr))?;

        if (inst.bet / 2) as u64 > user.credits {
            return Err(StdError::generic_err("Not enough credits to place bet"));
        }

        if !inst.dealt { return Err(StdError::generic_err("Not yet dealt!")) }


        if translate_card (inst.dealer[0]).1 != 0 {
            return Err(StdError::generic_err("Dealer has no ace!"));
        }

        inst.insurance = true;
        inst.timestamp = env.block.time;
        INSTANCES.insert(deps.storage, &sender_addr, &inst)?;
        
        // debit credits
        let config = CONFIG.load(deps.storage)?;
        let down_credit_msg = ContractMsg::DownCredit { addr: sender_addr, amount: (inst.bet / 2) as u64 };
        let cosmos_msg = WasmMsg::Execute {
            contract_addr: config.parent_contract,
            code_hash: config.parent_hash,
            msg: to_binary(&down_credit_msg)?,
            funds: vec![],
        };

        Ok(Response::new().add_message(cosmos_msg))
    }