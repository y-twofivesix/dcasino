"use client";

import { check_env, do_init, swal_success } from '@/src/helpers';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Card {
  name: string,
  icon: string,
  route: string
}

export default function Home() {

  const { push } = useRouter();
  const [hovered, setHovered] = useState('')
  const [show_wallets, setShowWallets] = useState(false);

  const handleConnect = async (route: string) =>{

    let wallets = [];
      //@ts-ignore
    if (window.keplr) wallets.push('Keplr');
    //@ts-ignore
    if (window.leap) wallets.push('Leap');
     //@ts-ignore
    if (window.ethereum) wallets.push('MetaMask');
    //@ts-ignore
    if (window.fina) wallets.push('Fina');

    if (wallets.length==1) {
      await swal_success(`${wallets[0]} wallet detected!`);
      // do init
      await try_enter_game(wallets[0], route);
    } else  {
      // show wallet options
      setShowWallets(true);
    }
  }

  const try_enter_game = async ( wallet: string, route: string) => {
    setShowWallets(false);
    if (await do_init(wallet)) {
      await check_env();
      push(route);

    }
  }


  const cards : Card[] = [
    {name: 'Video Poker', icon: 'arcade.png', route:'videopoker'},
    {name: 'BlackJack (Vingt et un)', icon: 'spade.png', route:''},
  ]

  return (

    <motion.div
    exit={{ opacity: 0 }}
    className='w-screen h-screen bg-[#6600ff] relative'>
      <div className='h-fit w-fit absolute left-0 right-0 top-0 bottom-0 m-auto'>
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
                  onClick={_=>handleConnect(cards[i].route)}
                  initial={{ opacity: 0, height: "500px", width: "250px", }}
                  animate={{ 
                    opacity: 1,
                  }}
                  transition={{duration: 1}}
                  className={`
                  bg-[#9900ff] relative hover:bg-red-600
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

        <div className='w-full h-10 text-neutral-200 text-center p-4'>{hovered}</div>
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
