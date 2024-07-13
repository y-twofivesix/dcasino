
use cosmwasm_std::{ StdError, StdResult};

// translates a number into a card by its suit and rank
#[inline(always)]
pub fn translate_card(value: u8) -> (u8, u8) {
    let quot = value / 13;
    let rem = value % 13;

    let suit: u8 = match quot {
        0 | 4 | 8 | 12 => 0,
        1 | 5 | 9 | 13 => 1,
        2 | 6 | 10 | 14 => 2,
        3 | 7 | 11 | 15 => 3,
        _ => unreachable!(),
    };

    (suit, rem)
}

#[inline(always)]
pub fn try_option<T>(option: Option<T>) -> StdResult<T> {
    if let Some(inner) = option {
        Ok(inner)
    } else {
        Err(StdError::generic_err("Item doesn't exist".to_string()))
    }
}
