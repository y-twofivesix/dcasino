"use client";

import { check_env, do_init, swal_alert, swal_error, swal_input, swal_success } from '@/src/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faKey, faSquareCheck } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants'
import { user } from '@/src/queries';
import { IUser } from '@/src/interfaces';
import { send_tx } from '@/src/transactions';

interface Card {
  name: string,
  icon: string,
  route: string
}

export default function Home() {

  const { push } = useRouter();
  const [hovered, setHovered] = useState('')
  const [user_info, setInfo] = useState(undefined as IUser | undefined)

  useEffect(function () {
    
  }, [dcasino.user_info])

  const cards : Card[] = [
    {name: 'Video Poker', icon: 'arcade.png', route:'videopoker'},
    {name: 'BlackJack (Vingt et un) COMING SOON', icon: 'spade.png', route:''},
  ]

  return (

    <motion.div
    exit={{ opacity: 0 }}
    className='w-screen h-screen bg-orange-100 relative p-3'>


      <div className='text-center text-9xl px-32 py-10 font-casino text-black'>
        SCRT CASINO
      </div>


      <div className='h-fit w-fit absolute left-0 right-0 bottom-15 m-auto'>
        <div className={'grid grid-cols-3 gap-4'}>
          {
            (()=>{
              let entries = []
              for (let i=0; i<cards.length; i++) {
                entries.push(
                  <motion.div
                  key={i}
                  onHoverStart={_=>setHovered(cards[i].name)}
                  onHoverEnd={_=>setHovered('')}
                  onClick={async _=>{
                    if (!dcasino.ready) return 
                    if (!dcasino.vk_valid) {
                      await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
                      return
                    }
                    push(cards[i].route);
                  }}
                  initial={{ opacity: 0, height: "375px", width: "250px", }}
                  animate={{ 
                    opacity: dcasino.ready?1: 0.1,
                  }}
                  transition={{duration: 1}}
                  className={`
                  bg-orange-200 relative hover:bg-green-600
                  rounded-xl duration-700 shadow-retro`}>

                      {
                        <motion.img
                        animate={{opacity:0.75, scale: 0.75}}
                        transition={{duration: 1}}
                        whileHover={{ opacity: 1 }}
                        className='absolute m-auto left-0 right-0 top-0 bottom-0'
                        src={`/images/${cards[i].icon}`}
                        />
                      }
                      
                  </motion.div>
                );
              }
              return entries;
            })()
          }
        </div>

        <div className={`${ dcasino.ready?'':'opacity-10'} py-10 text-black font-casino text-4xl`}>
          <div className='p-1'>credits: {dcasino.user_info?dcasino.user_info.credits:'-'}</div>
          <div>
            <span 
            onClick={async _=>{

              if (!dcasino.ready) return 

              let amount = parseInt(await swal_input('enter amount in SCRT'));
              if( isNaN(amount)) {
                await swal_error('invalid number')
                return;
              }

              let tx = await send_tx(
                dcasino.DCASINO_CONTRACT_ADDRESS,
                dcasino.dcasino_code_hash, 
                { pay_in : { amount }},
                [{ amount: String(amount * 1_000_000), denom: 'uscrt' }], 
                66_000);
    
            if (typeof tx === 'string') {
                await swal_error (tx);
                return;
            } else {
              await swal_success('transaction complete!', '',1500)
            }

            }}
            className={`
            p-2 mx-1 w-[200px] text-center 
            text-black font-casino text-4xl 
            bg-orange-200 hover:bg-yellow-400
            hover:text-yellow-100 rounded-xl`}>Pay In</span>
            <span 
            onClick={async _=>{

              if (!dcasino.ready) return 
              let tx = await send_tx(
                dcasino.DCASINO_CONTRACT_ADDRESS,
                dcasino.dcasino_code_hash, 
                { pay_out : {  } },
                [], 
                66_000);
    
            if (typeof tx === 'string') {
                await swal_error (tx);
                return;
            } else {
              await swal_success('transaction complete!', '',1500)
            }

            }}
            className={`
            p-2 mx-1 w-[200px] text-center 
            text-black font-casino text-4xl 
            bg-orange-200 hover:bg-yellow-400
            hover:text-yellow-100 rounded-xl`}>Pay out</span>
          </div>

        </div>

        <div className='w-full h-10 text-neutral-800 text-center p-4'>{hovered}</div>
      </div>
    </motion.div>

  )
}

/*
        <motion.div
        animate={{ opacity: show_wallets ? 1: 0, scale: show_wallets ? 1: 0}}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01]
        }}
        className={` ${show_wallets ? '':'hidden'}
        absolute bg-red-600 h-fit text-center
         top-0 bottom-0 left-0 right-0 m-auto z-50
         p-4 rounded-2xl w-1/3`}>
          <h1 className='px-2 py-4 text-base rounded-2xl'>Choose your wallet</h1>
          <ul>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await try_enter_game('Keplr')}>Keplr</li>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await try_enter_game('MetaMask')}>MetaMask</li>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await try_enter_game('Fina')}>Fina</li>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await try_enter_game('Leap')}>Leap</li>
          </ul>
        </motion.div>
*/
