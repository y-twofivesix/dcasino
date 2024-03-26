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
  const [show_wallets, setShowWallets] = useState(false);
  const [route, setRoute] = useState('')
  const [wallet_addr, setWallet] = useState(undefined as string | undefined);
  const [user_info, setUserInfo] = useState(undefined as IUser | undefined);
  const [need_vk, setNeedVk] = useState(false);

  const bolt = <FontAwesomeIcon color='white' icon={faBolt} />
  const key = <FontAwesomeIcon color='white' icon={faKey} />
  const check = <FontAwesomeIcon color='white' icon={faSquareCheck} />


  const do_query = useCallback(async () => {
    if (!dcasino.ready) return 

    let user_res = await user()
    if (user_res.is_ok) {
      setUserInfo(user_res.inner as IUser)
      setNeedVk(false)
    } 
    else if (ERR_UNAUTHORISED.test(user_res.inner as string)) {
      
      
      setNeedVk(true)
    }
  }, [wallet_addr, need_vk]);

  useEffect(function () {
    do_query();
    const id = setInterval(do_query, 5_000);
    return () => clearInterval(id);
  }, [])

  const handleConnect = async () =>{

    if (wallet_addr) {
      setWallet(undefined)
      dcasino.ready = false;
      return;
    }
    
    setRoute(route)
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
      await swal_success(`${wallets[0]} wallet detected!`, '', 1500);
      // do init
      //await try_enter_game(wallets[0], route);
      await connect(wallets[0]);

    } else  {
      //@ts-ignore
      // show wallet options
      setShowWallets(true);
    }
  }

  const connect = async ( wallet: string,) => {
    setShowWallets(false);
    if (await do_init(wallet)) {
      await check_env();
      let addr_pre = dcasino.granter.address.substring(0,5)
      let addr_end = dcasino.granter.address.substring(40)

      setWallet(`${wallet} ${addr_pre}...${addr_end}`)
    }
  }

  const cards : Card[] = [
    {name: 'Video Poker', icon: 'arcade.png', route:'videopoker'},
    {name: 'BlackJack (Vingt et un) COMING SOON', icon: 'spade.png', route:''},
  ]

  return (

    <motion.div
    exit={{ opacity: 0 }}
    className='w-screen h-screen bg-orange-100 relative p-3'>


      <motion.div
        animate={{ opacity: show_wallets ? 1: 0, scale: show_wallets ? 1: 0}}
        transition={{
          duration: 0.4,
          delay: 0.2,
          ease: [0, 0.71, 0.2, 1.01]
        }}
        className={` ${show_wallets ? '':'hidden'}
        absolute bg-orange-300 h-fit text-center
         top-0 bottom-0 left-0 right-0 m-auto z-50
         p-4 rounded-2xl 
         w-1/3`}>
          <h1 className=' px-2 py-4 text-4xl rounded-2xl font-casino'>Choose your wallet</h1>
          <ul>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Keplr')}>Keplr</li>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('MetaMask')}>MetaMask</li>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Fina')}>Fina</li>
            <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Leap')}>Leap</li>
          </ul>
      </motion.div>

        <div className='text-xl text-white py-2'>
          <span 
          onClick={async _=> await swal_alert('kyc + aml step coming soon!')}
          className={
            `${
              user_info && user_info.kyc_validated
              ? 'bg-green-600'
              :'bg-red-600'} 
              p-2 mx-2 rounded-2xl`}>{check}
          </span>
          <span 
          onClick={async _=> await dcasino.generate_vk()}
          className={
            `${
              wallet_addr && !need_vk
              ? 'bg-green-600'
              :'bg-red-600'} 
              p-2 mx-2 rounded-2xl`}>{key}
          </span>
          <span 
          onClick={async _=> await handleConnect()}
          className={
            `${
              wallet_addr 
              ? 'bg-green-600 hover:bg-red-600'
              :'bg-red-600 hover:bg-green-600'} 
              p-2 mx-2 hover:opacity-100 opacity-50 rounded-2xl`}>{bolt}
          </span>

          <span 
        className='p-2 rounded-2xl bg-neutral-800 w-fit duration-700'>
          { 
            wallet_addr 
            ? <span className=''>{wallet_addr}</span>
            : <span className=''>not connected</span>
          }
          </span>
        </div>

        
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
                    if (!dcasino.ready || !wallet_addr) return 
                    if (need_vk) {
                      await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
                      return
                    }
                    push(cards[i].route);
                  }}
                  initial={{ opacity: 0, height: "375px", width: "250px", }}
                  animate={{ 
                    opacity: wallet_addr?1: 0.1,
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

        <div className={`${wallet_addr?'':'opacity-10'} py-10 text-black font-casino text-4xl`}>
          <div className='p-1'>credits: {user_info?user_info.credits:'-'}</div>
          <div>
            <span 
            onClick={async _=>{

              if (!dcasino.ready || !wallet_addr) return 

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

              if (!dcasino.ready || !wallet_addr) return 
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
