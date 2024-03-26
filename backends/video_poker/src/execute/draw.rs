use cosmwasm_std::{ to_binary, DepsMut, Env, MessageInfo, Response, StdError, StdResult, WasmMsg};

use crate::{generated::state::{CONFIG, INSTANCES}, helpers::try_option};

use super::ContractMsg;

// Ask contract to deal 4 cards to player
pub fn execute_draw(
    deps : DepsMut,
    env  : Env, 
    info : MessageInfo,
    held : Vec<u8>) -> StdResult<Response> {
        
        let sender_addr = info.sender.to_string();
        let mut inst = try_option(INSTANCES.get(deps.storage, &info.sender.to_string()))?;
        if !inst.dealt { return Err(StdError::generic_err("Not yet dealt!")) }

        // reset dealt flag so that after draw result can play again.
        inst.dealt = false;
        inst.timestamp = env.block.time;
        let value = inst.draw(&held)?;

        // if value is non-zero its a win! Send the corresponding token value
        if value != 0 {

            let prize : u64 = value as u64 * inst.bet as u64;

            // add credits
            let config = CONFIG.load(deps.storage)?;
            let down_credit_msg = ContractMsg::UpCredit { addr: sender_addr.clone(), amount: prize as u64 };

            let cosmos_msg = WasmMsg::Execute {
                contract_addr: config.parent_contract,
                code_hash: config.parent_hash,
                msg: to_binary(&down_credit_msg)?,
                funds: vec![],
            };

            inst.last_win = prize;
            INSTANCES.insert(deps.storage, &sender_addr, &inst)?;
            return Ok(Response::new().add_message(cosmos_msg).add_attribute("credits", prize.to_string()))

        }

        inst.last_win = 0;
        INSTANCES.insert(deps.storage, &info.sender.to_string(), &inst)?;
        Ok(Response::new())
    }