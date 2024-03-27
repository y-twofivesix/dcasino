"use client";

import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants';
import { check_env, do_init, swal_alert, swal_success } from '@/src/helpers';
import { IUser } from '@/src/interfaces';
import { user } from '@/src/queries';
import { faBolt, faHome, faKey, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useCallback } from 'react'
import { useState, useEffect } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard';



function Header() {

  const [wallet_addr, setWallet] = useState(undefined as string | undefined);
  const [user_info, setUserInfo] = useState(undefined as IUser | undefined);
  const [need_vk, setNeedVk] = useState(false);
  const [show_wallets, setShowWallets] = useState(false);


  const bolt = <FontAwesomeIcon color='white' icon={faBolt} />
  const key = <FontAwesomeIcon color='white' icon={faKey} />
  const check = <FontAwesomeIcon color='white' icon={faSquareCheck} />
  const home = <FontAwesomeIcon color='black' icon={faHome} />


  const do_query = useCallback(async () => {
    if (!dcasino.ready) return 

    let user_res = await user()
    if (user_res.is_ok) {
      setUserInfo(user_res.inner as IUser)
      dcasino.user_info = user_res.inner as IUser;
      dcasino.vk_valid = true;
    } 
    else if (ERR_UNAUTHORISED.test(user_res.inner as string)) {
      
      dcasino.vk_valid = false;
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
    
    //setRoute(route)
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

  
  return (
    <div id='header' className={`w-screen no-select fixed z-50 px-5 py-3`}>

        <Link className='right-8 absolute hover:invert' href="/">{home}</Link>

        <motion.div
          animate={{ opacity: show_wallets ? 1: 0, scale: show_wallets ? 1: 0}}
          transition={{
            duration: 0.4,
            delay: 0.2,
            ease: [0, 0.71, 0.2, 1.01]
          }}
          className={` ${show_wallets? '':'hidden'}
          fixed bg-orange-300 h-fit text-center
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
            ? <span className=''>
                
                  {wallet_addr}
                </span>
            : <span className=''>not connected</span>
          }
          </span>
        </div>

    </div>

  )

}

export default Header