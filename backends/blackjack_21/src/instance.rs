
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::{helpers::translate_card, rng::Pcg64};
use cosmwasm_std::{StdError, StdResult, Timestamp};

#[derive(Serialize, Debug, Deserialize, Clone, JsonSchema)]
pub struct Instance {
    pub deck: Vec<u8>,
    pub hand: Vec<u8>,
    pub dealer: Vec<u8>,
    pub rng: Pcg64,
    pub dealt: bool,
    pub bet: u8,
    pub last_win: u64,
    pub outcome: Outcome,
    pub timestamp: Timestamp,
}

#[derive(Debug, PartialEq, Clone, Serialize, Deserialize, JsonSchema)]
pub enum Outcome {
    Undefined,
    Bust,
    Push, // aka draw
    Win,
    Lose,
}

impl Instance {

    pub fn deal (&mut self) -> StdResult<()> {

        if self.dealt {
            return Err(StdError::generic_err("Already dealt!"))
        }
        // do tidy up from previous game if 
        // present
        if !self.hand.is_empty() {
            self.deck.append(&mut self.hand);
            self.deck.append(&mut self.dealer);
        }

        self.shuffle_deck(2);

        // deal out one card for self and dealer
        self.hand.push(self.deck.pop().unwrap());
        self.dealer.push(self.deck.pop().unwrap());
        
        self.dealt = true;

        Ok(())
    }

    pub fn hit (&mut self ) -> StdResult<()> {
 
        if !self.dealt {
            return Err(StdError::generic_err("Not dealt yet!"))
        }
        self.hand.push(self.deck.pop().unwrap());
        // TODO: if bust set state to bust and reset instance
        if self.score() > 21 {
            self.dealt = false;
            self.outcome = Outcome::Bust;
        }
        
        Ok(())
        
    }

    pub fn stand (&mut self) -> StdResult<()> {

        let mut score = self.score();
        let mut dealer_score;
        let dealer_risk_tol = 17;

        loop {

            dealer_score = self.dealer_score();
            if  dealer_score == 21 || 
                dealer_score > score ||
                (dealer_score == score && dealer_score > dealer_risk_tol )
                { break }

            self.dealer.push(self.deck.pop().unwrap());
        }
        
        if dealer_score > 21 { dealer_score = 0 }
        if score > 21 { score = 0}

        if score == dealer_score {
            self.outcome = Outcome::Push;
        } else if score > dealer_score {
            self.outcome = Outcome::Win;
        } else {
            self.outcome = Outcome::Lose;
        }
        
        Ok(())
    }

    pub fn shuffle_deck(&mut self, times: u8) {
        Self::internal_shuffle_deck(&mut self.deck, times, &mut self.rng);
    }

    fn dealer_score(&self) -> u8 {

        let aces : u8 = self.dealer.iter().filter(|&card| translate_card(*card).1 == 0 ).count() as u8;
        let mut intermediate : u8 = self.dealer.iter().map(
            | card | {

                let raw_card = translate_card(*card).1;
                match raw_card {
                    10 | 11 | 12 => 10,
                    0 => 11,
                    _ => raw_card + 1
                }
            }
         ).sum();

         // try to handle bust with aces
         if intermediate > 21 {
            for _ in 0u8..aces {
                intermediate -= 10;
                if intermediate <= 21 { break }
            }
         }

         intermediate
    }


    fn score(&self) -> u8 {

        let aces : u8 = self.hand.iter().filter(|&card| translate_card(*card).1 == 0 ).count() as u8;
        let mut intermediate : u8 = self.hand.iter().map(
            | card | {

                let raw_card = translate_card(*card).1;
                match raw_card {
                    10 | 11 | 12 => 10,
                    0 => 11,
                    _ => raw_card + 1
                }
            }
         ).sum();

         // try to handle bust with aces
         if intermediate > 21 {
            for _ in 0u8..aces {
                intermediate -= 10;
                if intermediate <= 21 { break }
            }
         }

         intermediate
    }

    fn internal_shuffle_deck(deck: &mut Vec<u8>, times: u8, rng: &mut Pcg64) {
        for _ in 0..times {
            for i in 0..deck.len() {
                let swap = rng.next_u64() as usize % deck.len();
                deck.swap(i, swap);
            }
        }
    }

}

#[cfg(test)]
mod test_instance {

    use super::*;

    fn mock_inst() -> Instance {
        Instance {
            deck: (0..52).collect::<Vec<u8>>(),
            hand: vec![],
            dealer: vec![],
            dealt: false,
            rng: Pcg64::from_seed([0u8; 32]),
            bet: 1,
            last_win: 0,
            outcome: Outcome::Undefined,
            timestamp: Timestamp::from_seconds(0),
        }
    }

    #[test]
    fn test_game() {
        let mut inst = mock_inst();
        assert!(inst.deal().is_ok());

        // initial contidions
        assert_eq!(inst.score(), 8);
        assert_eq!(translate_card(inst.hand[0]).1, 7);

        // do 1 hit
        let result = inst.hit();
        assert_eq!(inst.score(), 19);
        assert_eq!(translate_card(inst.hand[1]).1, 0);
        assert_eq!(result, Ok(()));
        assert_eq!(inst.outcome, Outcome::Undefined);

        // stand
        let final_outcome = inst.stand();
        assert_eq!(inst.dealer_score(), 20);
        assert_eq!(final_outcome, Ok(()));
        assert_eq!(inst.outcome, Outcome::Lose);

    }

    #[test]
    fn test_aces_score() {
        let mut inst = mock_inst();

        inst.hand = vec![0, 13, 8];
        assert_eq!(inst.score(), 21);

        inst.hand = vec![0, 13, 10];
        assert_eq!(inst.score(), 12);

        inst.dealer = vec![0, 13, 8];
        assert_eq!(inst.dealer_score(), 21);

        inst.dealer = vec![0, 13, 10];
        assert_eq!(inst.dealer_score(), 12);

    }

    #[test]
    fn test_push() {
        let mut inst = mock_inst();

        inst.hand = vec![0, 13, 8];
        assert_eq!(inst.score(), 21);

        inst.hand = vec![0, 13, 10];
        assert_eq!(inst.score(), 12);

        inst.dealer = vec![0, 13, 8];
        assert_eq!(inst.dealer_score(), 21);

        inst.dealer = vec![0, 13, 10];
        assert_eq!(inst.dealer_score(), 12);

    }

}
