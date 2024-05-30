use cosmwasm_std::{to_binary, DepsMut, Env, MessageInfo, Response, StdError, StdResult, WasmMsg};

use crate::{generated::state::{CONFIG, INSTANCES}, helpers::try_option, instance::{Instance, Outcome}, query::{alias::query_alias_of, contract_query_user}, rng::Pcg64};

use super::ContractMsg;


    // Ask contract to deal 4 cards to player
pub fn execute_deal( deps : DepsMut,
    env : Env,
    info : MessageInfo,
    bet : u8,
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

        if bet as u64 > user.credits {
            return Err(StdError::generic_err("Not enough credits to place bet"));
        }

        let mut inst = match try_option(INSTANCES.get(deps.storage, &sender_addr)) {
            Ok(inst) => inst,
            _ => Instance {
                deck: (0..52).collect::<Vec<u8>>(),
                hand: vec![],
                dealer: vec![],
                dealt: false,
                rng: Pcg64::from_seed(try_option(env.block.random.clone())?.to_array::<32>()?),
                bet,
                last_win: 0,
                outcome: Outcome::Undefined,
                timestamp: env.block.time,
            }
        };

        if inst.dealt {
            return Err(StdError::generic_err("already dealt"));
        }

        inst.deal()?;
        inst.bet = bet;
        inst.timestamp = env.block.time;
        INSTANCES.insert(deps.storage, &sender_addr, &inst)?;
        
        // debit credits
        let config = CONFIG.load(deps.storage)?;
        let down_credit_msg = ContractMsg::DownCredit { addr: sender_addr, amount: bet as u64 };
        let cosmos_msg = WasmMsg::Execute {
            contract_addr: config.parent_contract,
            code_hash: config.parent_hash,
            msg: to_binary(&down_credit_msg)?,
            funds: vec![],
        };

        Ok(Response::new().add_message(cosmos_msg))
    }