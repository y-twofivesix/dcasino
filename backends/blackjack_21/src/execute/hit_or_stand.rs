use cosmwasm_std::{ to_binary, DepsMut, Env, MessageInfo, Response, StdError, StdResult, WasmMsg};

use crate::{generated::state::{CONFIG, INSTANCES}, helpers::try_option, instance::Outcome, query::alias::query_alias_of};

use super::ContractMsg;

// Ask contract to deal 4 cards to player
pub fn execute_hit(
    deps : DepsMut,
    env  : Env, 
    info : MessageInfo,
    sender_key: String,
    as_alias: bool) -> StdResult<Response> {
        
        let sender_addr = match as_alias {
            false => info.sender.to_string(),
            true => query_alias_of(deps.storage, &deps.querier, info.sender.to_string(), sender_key)?.alias_of
        };
        
        let mut inst = try_option(INSTANCES.get(deps.storage, &sender_addr))?;
        if !inst.dealt { return Err(StdError::generic_err("Not yet dealt!")) }

        inst.timestamp = env.block.time;
        inst.hit()?;

        INSTANCES.insert(deps.storage, &sender_addr, &inst)?;
        Ok(Response::new())
    }

    pub fn execute_stand(
        deps : DepsMut,
        env  : Env, 
        info : MessageInfo,
        sender_key: String,
        as_alias: bool) -> StdResult<Response> {
            
            let sender_addr = match as_alias {
                false => info.sender.to_string(),
                true => query_alias_of(deps.storage, &deps.querier, info.sender.to_string(), sender_key)?.alias_of
            };
            
            let mut inst = try_option(INSTANCES.get(deps.storage, &sender_addr))?;
            if !inst.dealt { return Err(StdError::generic_err("Not yet dealt!")) }
    
            // reset dealt flag so that after draw result can play again.
            inst.dealt = false;
            inst.timestamp = env.block.time;
            inst.stand()?;
            if inst.outcome != Outcome::Lose {
                
                let prize : u64 = match inst.outcome {
                    Outcome::Win => 2 * inst.bet as u64,
                    Outcome::Push => inst.bet as u64,
                    _ => 0
                };

                // add credits
                let config = CONFIG.load(deps.storage)?;
                let up_credit_msg = ContractMsg::UpCredit { addr: sender_addr.clone(), amount: prize as u64 };
    
                let cosmos_msg = WasmMsg::Execute {
                    contract_addr: config.parent_contract,
                    code_hash: config.parent_hash,
                    msg: to_binary(&up_credit_msg)?,
                    funds: vec![],
                };
    
                inst.last_win = prize;
                INSTANCES.insert(deps.storage, &sender_addr, &inst)?;
                return Ok(Response::new().add_message(cosmos_msg).add_attribute("credits", prize.to_string()))
            }
    
            INSTANCES.insert(deps.storage, &sender_addr, &inst)?;
            Ok(Response::new())
        }