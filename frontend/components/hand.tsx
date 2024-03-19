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
    //@ts-ignore
    if (audio) audio.play();
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
            className={`float-left w-1/5 relative p-2`}>
              <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: hold || !props.dealt? 1:0.5  }}
              width="0"
              height="0"
              sizes="100vw"
              className={`${props.dark?'invert':''} w-fit h-[250px] select-none left-0 right-0 m-auto p-2`}
              alt='hand4'
              //src={`/deck2/as.svg`}
              src={`/deck2/${numberToImg(card)}.png`}
              />

              <div className={`
              text-center w-full p-2 text-neutral-800 ${props.dealt? '':'hidden'}
              ${hold ? 'bg-neutral-300' :''} `}>
                {hold ? 'held!' : 'click to hold'}
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