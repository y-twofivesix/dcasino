import React, { Dispatch, SetStateAction, useState } from 'react'
import { motion } from "framer-motion"
import { PlainViewer2, Viewer, slide } from './components'
import VideoPoker from './videopoker'
import BlackJack21 from './blackjack_21'

interface ConsultProps {
    show_games: boolean
    setShowGames: Dispatch<SetStateAction<boolean>>,
    dark: boolean
}

function Games(props: ConsultProps) {
  const [dapp, setDapp] = useState(undefined as undefined | string);

  return (
    <>
     <Viewer
    show={props.show_games}
    setShow={props.setShowGames}
    dark={props.dark}
    vert={false}
      >
        {[

        slide(
          ['Video Poker', 'vp-sys-font'], 
          <>
          {`Our Video Poker game is a retro CRT styled classic. It's easy to play, place a bet, and
          hit deal, you will be dealt 5 randonly generated cards using Secret Network's verifiable random 
          number generator (Secret VRF), you can then choose to hold any of your five
          cards, before dealing another set of shuffled cards.`}
          <br/><br/>
          {`The number of credits you may win
          depends on your final hand, good luck!`}
          <br/><br/>

          </>,
            <motion.div
              initial={{ opacity: 0, translateY: 0}}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 1 }}
              className="relative hidden md:flex">
                <motion.img
                  className="absolute left-0 right-0 top-0 bottom-m m-auto invert"
                  src="/images/arcade.png"
                  alt="video poker"
                  width={150}
                  height={150}
                />
              </motion.div>, setDapp ),

        slide(
          ['Black Jack (21)', ''], 
          <>
          {`The classic casino game of luck and strategy! 
          It is the most widely played casino banking game in the world. 
          Also known as "twenty-one". `}
          <br/><br/>

          </>,
            <motion.div
              initial={{ opacity: 0, translateY: 0}}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 1 }}
              className="relative hidden md:flex">
                <motion.img
                  className="absolute left-0 right-0 top-0 bottom-m m-auto invert"
                  src="/images/spade.png"
                  alt="video poker"
                  width={150}
                  height={150}
                />
              </motion.div>, setDapp )
      ]}
      </Viewer>

      <PlainViewer2 
      show={ dapp == 'Video Poker' } 
      setShow={setDapp} 
      dark={props.dark} 
      vert={true}
      dims={{x:500, y: 500}}>
        <VideoPoker active={dapp == 'Video Poker'}/>
      </PlainViewer2>

      <PlainViewer2 
      show={dapp == 'Black Jack (21)'} 
      setShow={setDapp} 
      dark={props.dark} 
      vert={true}
      dims={{x:500, y: 500}}>
        <BlackJack21 active={dapp == 'Black Jack (21)'}/>
      </PlainViewer2>
    </>
   
    
  )
}

export default Games