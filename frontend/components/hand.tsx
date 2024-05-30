import { numberToImg } from '@/src/helpers';
import React from 'react'
import { motion } from 'framer-motion'

interface HandProps {
    hand : number[],
    dealt: boolean,
    held: Set<number>,
    setHeld:  React.Dispatch<React.SetStateAction<Set<number>>>,
    updated:  string,
    dark: boolean
}


function Hand(props : HandProps) {

  
  const handleClickCard = (num : number) => {

    if (!props.dealt) return
  
    if (props.held.has(num)) {
      // remove it from the held set
      props.setHeld(prev_set => new Set([...prev_set].filter(x => x !== num)))
    } else {
      // add it to the unheld set
      props.setHeld(prev_set => new Set<number>([...prev_set, num]))
    }
    
    play('select')

  }
  
  function play(id: string) {
    var audio = document.getElementById(id);

    if (audio) { 
      //@ts-ignore
      audio.volume = 0.2;
      //@ts-ignore
      audio.play();
    }
  }
  
  return (
    <>
    {
      (()=>{
        let entries = []
        for (const card of props.hand) {
          let hold = props.held.has(card)
          entries.push(
            <div
            onClick={_ => handleClickCard(card)}
            className={`float-left w-1/5  relative px-2`}>
              <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: hold || !props.dealt? 1:0.75 , translateY: hold? -10: 0 }}
              width="0"
              height="0"
              sizes="100vw"
              className={`${props.dark?'invert':''} w-full h-full select-none left-0 right-0 m-auto rounded-lg bg-white`}
              alt='hand'
              //src={`/deck2/as.svg`}
              src={numberToImg(card)}
              />

              <div className={`
              text-center w-full p-1 text-neutral-800 ${props.dealt? '':'hidden'}
              ${hold ? 'bg-neutral-300' :''} `}>
                {hold ? 'held!' : 'hold?'}
              </div>
          </div>
          )
        }
        return entries
      })()
    }

    </>

  )
  
}

export default Hand