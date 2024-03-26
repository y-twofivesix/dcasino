use cosmwasm_std::{to_binary, DepsMut, Env, MessageInfo, Response, StdError, StdResult, WasmMsg};

use crate::{generated::state::{CONFIG, INSTANCES}, helpers::try_option, instance::{Instance, Outcome}, query::contract_query_user, rng::Pcg64};

use super::ContractMsg;


    // Ask contract to deal 4 cards to player
pub fn execute_deal( deps : DepsMut,
    env : Env,
    info : MessageInfo,
    bet : u8,
    sender_key: String,
    hash : String,
    contract : String) -> StdResult<Response> {

        let sender_addr = info.sender.to_string();
        let user = contract_query_user(
            &deps.querier, 
            &sender_addr, 
            &sender_key,
            &hash,
            &contract)?;

        if bet as u64 > user.credits {
            return Err(StdError::generic_err("Not enough credits to place bet"));
        }

        let mut inst = match try_option(INSTANCES.get(deps.storage, &info.sender.to_string())) {
            Ok(inst) => inst,
            _ => Instance {
                deck: (0..52).collect::<Vec<u8>>(),
                hand: vec![],
                dealt: false,
                rng: Pcg64::from_seed(try_option(env.block.random.clone())?.to_array::<32>()?),
                bet,
                last_outcome: format!("{:?}", Outcome::Undefined),
                last_win: 0,
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