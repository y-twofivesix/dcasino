use cosmwasm_std::{BankMsg, Coin, CosmosMsg, Env, MessageInfo, Response, StdError, StdResult};

#[inline(always)]
fn type_of<T>(_: &T) -> String {
    format!("{}", std::any::type_name::<T>())
}

#[inline(always)]
pub fn try_option<T>(option: Option<T>) -> StdResult<T> {
    if let Some(inner) = option {
        Ok(inner)
    } else {
        let type_of_object = type_of(&option);
        Err(StdError::generic_err(format!(
            "Item doesn't exist {type_of_object}"
        )))
    }
}

pub fn make_payment(env: &Env, info: &MessageInfo, value: u128, denom: String) -> StdResult<()> {
    // check user can pay entry fee
    if let Some(coin) = info
        .funds
        .iter()
        .find(|coin| -> bool { coin.denom == denom })
    {
        if coin.amount < value.into() {
            return Err(StdError::generic_err(format!(
                "Insufficient funds: funds={} entry={}",
                coin.amount, value
            )));
        }
        if coin.amount > value.into() {
            return Err(StdError::generic_err(format!(
                "Excessive funds: funds={} entry={}",
                coin.amount, value
            )));
        }
    } else {
        return Err(StdError::generic_err("No funds".to_string()));
    }

    let _: CosmosMsg<Response> = CosmosMsg::Bank(BankMsg::Send {
        to_address: env.contract.address.clone().into_string(),
        amount: vec![Coin::new(value, denom)],
    });

    Ok(())
}
