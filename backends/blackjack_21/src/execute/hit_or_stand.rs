use cosmwasm_std::{ to_binary, DepsMut, Empty, Env, MessageInfo, Response, StdError, StdResult, WasmMsg};

use crate::{generated::state::{CONFIG, INSTANCES}, helpers::try_option, instance::Outcome, query::{alias::query_alias_of, contract_query_user}};

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
        as_alias: bool,
        double_down: bool) -> StdResult<Response> {
            
            let mut response : Response<Empty> = Response::new();
            let sender_addr = match as_alias {
                false => info.sender.to_string(),
                true => query_alias_of(deps.storage, &deps.querier, info.sender.to_string(), sender_key.clone())?.alias_of
            };
            
            let mut inst = try_option(INSTANCES.get(deps.storage, &sender_addr))?;
            if !inst.dealt { return Err(StdError::generic_err("Not yet dealt!")) }
            if inst.hand.len() < 2 { return Err(StdError::generic_err("Not enough cards!"))}
    
            if double_down { 
                
                let user = contract_query_user(
                    deps.storage,
                    &deps.querier, 
                    sender_addr.clone(), 
                    sender_key)?;
        
                if inst.bet as u64 > user.credits {
                    return Err(StdError::generic_err("Not enough credits to place bet"));
                }
                
                inst.hit()?; 
            }
            inst.stand()?;

            // account for insurance
            if inst.insurance && inst.dealer_score() == 21  {

                // add credits
                let config = CONFIG.load(deps.storage)?;
                let up_credit_msg = ContractMsg::UpCredit { addr: sender_addr.clone(), amount: inst.bet as u64 };
    
                let cosmos_msg = WasmMsg::Execute {
                    contract_addr: config.parent_contract,
                    code_hash: config.parent_hash,
                    msg: to_binary(&up_credit_msg)?,
                    funds: vec![],
                };
    
                response = response.add_message(cosmos_msg).add_attribute("credits", inst.bet.to_string()); 
            }

            inst.dealt = false;
            inst.timestamp = env.block.time;
            
            if inst.outcome != Outcome::Lose && inst.outcome != Outcome::Bust {
                
                let multiplier = match double_down {
                    true => 4,
                    false => 2
                };

                let prize : u64 = match inst.outcome {
                    Outcome::Win => multiplier * inst.bet as u64,
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
                response = response.add_message(cosmos_msg).add_attribute("credits", prize.to_string());

            } else if double_down {

                // debit credits from double down
                let config = CONFIG.load(deps.storage)?;
                let down_credit_msg = ContractMsg::DownCredit { addr: sender_addr.clone(), amount: inst.bet as u64 };
                let cosmos_msg = WasmMsg::Execute {
                    contract_addr: config.parent_contract,
                    code_hash: config.parent_hash,
                    msg: to_binary(&down_credit_msg)?,
                    funds: vec![],
                };

                response = response.add_message(cosmos_msg);
                
            }
    
            INSTANCES.insert(deps.storage, &sender_addr, &inst)?;
            Ok(response)
        }