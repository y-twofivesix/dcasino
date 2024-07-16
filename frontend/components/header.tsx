"use client";

import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants';
import { check_env, do_init, swal_alert, swal_confirm, swal_error, swal_success } from '@/src/helpers';
import { IUser } from '@/src/interfaces';
import { user } from '@/src/queries';
import { faWallet, faKey, faMoon, faSquareCheck, faSun, faUserGroup, faUser, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import React, { Dispatch, SetStateAction, useCallback, useRef } from 'react'
import { useState, useEffect } from 'react'
import { Proof, Reclaim } from '@reclaimprotocol/js-sdk';
import { useQRCode } from 'next-qrcode';
import { send_tx } from '@/src/transactions';
import Swal from 'sweetalert2';
import About from '@/components/about'


interface HeaderProps {
  dark: boolean
}

function Header(props: HeaderProps) {

  const [wallet_addr, setWallet] = useState(undefined as string | undefined);
  const [user_info, setUserInfo] = useState(undefined as IUser | undefined);
  const [need_vk, setNeedVk] = useState(false);
  const [show_wallets, setShowWallets] = useState(false);
  const [show_kyc, setShowKYC] = useState(false);
  const [verification_link, setVerificationLink] = useState(undefined as string | undefined);
  const [proof, setProof] = useState(undefined as undefined | Proof)
  const [show_about, setShowAbout] = useState(false);


  const wallet = <FontAwesomeIcon color='white' icon={faWallet} />
  const key = <FontAwesomeIcon color='white' icon={faKey} />
  const check = <FontAwesomeIcon color='white' icon={faSquareCheck} />
  const alias = <FontAwesomeIcon color='black' icon={faUserGroup} />
  const usericon = <FontAwesomeIcon color='white' icon={faUser}/>
  const gear = <FontAwesomeIcon color='white' icon={faGear}/>

  const { Canvas } = useQRCode();

  let accepted_terms = false;

  const checkAcceptedTerms = async () => {

      let from_storage = window.localStorage.getItem('accepted_terms_060424');
      if (from_storage && from_storage == "true") {
        accepted_terms = true;
        return;
      }

      Swal.fire({
        title: 'Hold it right there',
        input: 'checkbox',
        allowOutsideClick: false,
        backdrop: `rgba(0,0,123,0.4)`,
        footer: '<a href="/legal" target="_blank">view our Terms and Conditions</a>',
        text: 
        `
        By agreeing to the Terms and Conditions, you acknowledge that dCasino is not designed 
        for use in every legal jurisdiction and represent that you have investigated your 
        personal legal situation and consulted with a legal representative in your 
        jurisdiction if necessary.

        Check the box below and click ok to confirm that you are not a citizen or 
        resident of any banned jurisdictions as outlined in our Terms and Conditions.`,
        inputPlaceholder: 'I accept the Terms and Conditions.'
      }).then((result) => {
        if (result.isConfirmed) {
          if (result.value) {

            accepted_terms = true;
            window.localStorage.setItem('accepted_terms_060424', 'true');

          } else {
            accepted_terms = false;
            window.localStorage.removeItem('accepted_terms_060424');
            Swal.fire({
              icon: 'error', 
              text: "Unfortunate :(", 
              timer: 1500, 
              backdrop: `rgba(0,0,123,0.4)`,
          });
          }
        } else {
          console.log(`modal was dismissed by ${result.dismiss}`)
        }
      })
  };

  const getVerificationReq = async (kyc_option: string) => {

    const APP_ID = "0x69cB759b1FBF3383F13f1b152a95031496A727BB";
    const reclaimClient = new Reclaim.ProofRequest(APP_ID);

    const providerIds = {
      'coinbase':'285a345c-c6a6-4b9f-9e1e-23432082c0a8', // Secondary_KYC_Coinbase
      'groww':'8a7f0989-c4d9-4528-ac82-a46abaa3c564', // Groww - Verified KYC
      'binance':'2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', // Binance KYC Level
      'okx':'502e352f-98cb-49c9-8885-12757b7a38d6', // Secondary KYC OKX
    };

    await reclaimClient.buildProofRequest(providerIds[kyc_option as keyof (typeof providerIds)])
  
    reclaimClient.setSignature(
      await reclaimClient.generateSignature('0x51bbcdd470c20893183b900b4c992dc8dab249dd69e4619a33b8b15c86b4f379')
    )

    reclaimClient.addContext(
      dcasino.granter.address,
      'KYC'
    )

    const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest()
    setVerificationLink( requestUrl );
    
      console.log('starting session');
      let stored_proof: Proof | string | null = window.localStorage.getItem(`dcasino_${dcasino.granter.address}_zk_proof`)
      if (stored_proof) {
        stored_proof = JSON.parse(stored_proof) as Proof;
      }

      let saved_proof = proof || stored_proof

      if (!saved_proof) {

        await reclaimClient.startSession({
          onSuccessCallback: async _proof => {
  
            await swal_success('ZK-Proof created','',1000);
            console.log('Verification success', _proof);
            setProof(_proof[0])
            window.localStorage.setItem(`dcasino_${dcasino.granter.address}_zk_proof`, JSON.stringify(_proof[0]));
            const onchain_proof = Reclaim.transformForOnchain(_proof[0]);
            let tx = await send_tx(
              dcasino.DCASINO_CONTRACT_ADDRESS,
              dcasino.dcasino_code_hash,
              {
                verify_proof : {
                  proof: onchain_proof,
                  contract: dcasino.reclaim_contract,
                  hash: dcasino.reclaim_code_hash
                }
              },[], 150_000);
  
              if (typeof tx === 'string') {
                await swal_error (`failed to send :${tx} please try again`);
                return;
              } else {
                  await swal_success('KYC complete!');
              }
            
            setVerificationLink( undefined );
            setShowKYC(false);
  
            // Your business logic here
            await swal_success('Verification success');
          },
          onFailureCallback: async error => {
            console.error('Verification failed', error);
            setVerificationLink( undefined );
            setShowKYC(false);
            // Your business logic here to handle the error
            await swal_error('Verification failed','',1000);
          }
        });
  
      } else {

        setVerificationLink( undefined );
        setShowKYC(false);

        const onchain_proof = Reclaim.transformForOnchain(saved_proof as Proof);
        let tx = await send_tx(
          dcasino.DCASINO_CONTRACT_ADDRESS,
          dcasino.dcasino_code_hash,
          {
            verify_proof : {
              proof: onchain_proof,
              contract: dcasino.reclaim_contract,
              hash: dcasino.reclaim_code_hash
            }
          },[], 150_000);

          if (typeof tx === 'string') {
            await swal_error (tx);
            return;
          } else {
              await swal_success('KYC complete!');
          }

      }


  };

  const do_query = useCallback(async () => {
    if (!dcasino.ready || !dcasino.granter) { 
      setWallet(undefined)
      dcasino.user_info = undefined;
      dcasino.pos_this_session = 0;
      dcasino.set_enable_alias(false);
      return 
    }

    let user_res = await user()
    if (user_res.is_ok) {
      setUserInfo(user_res.inner as IUser)
      dcasino.user_info = user_res.inner as IUser;
      dcasino.vk_valid = true;
      setNeedVk(false)
    } 
    else if (ERR_UNAUTHORISED.test(user_res.inner as string)) {
      
      dcasino.vk_valid = false;
      setNeedVk(true)
    }
  }, [wallet_addr, need_vk]);

  useEffect(function () {
    do_query();
    const id = setInterval(do_query, 5_000);
    return () => clearInterval(id);
  }, [])

  const handleAlias = async () => {

    if (!dcasino.ready || !wallet_addr){ 
      await swal_alert(`Please connect a wallet first`,'')
      return 
    }
    if (!dcasino.vk_valid) {
      await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
      return
    }

    // query 
    if (! await swal_confirm('set an alias?') ) return
    if (await dcasino.generate_alias()) { 
      await swal_success('alias created!','',1000);
      dcasino.set_enable_alias(true);
    }
  }

  const handleConnect = async () =>{

    if (!accepted_terms) {
      await checkAcceptedTerms();
      if (!accepted_terms) return
    }

    if (wallet_addr) {
      setWallet(undefined);
      dcasino.ready = false;
      dcasino.user_info = undefined;
      dcasino.pos_this_session = 0;
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
    <div id='header' className={`top-0 w-fit no-select fixed z-50 px-5 py-3 ${props.dark?'invert':''}`}>

      <div 
      onClick={_=>setShowAbout(!show_about)}
      className={`rounded-xl p-2 text-white`}>
      {dcasino.ready?gear:usericon} {dcasino.ready?'ACCOUNT':'CONNECT'}
      </div>
      <About show_about={show_about} setShowAbout={setShowAbout} dark={true}/>

    </div>

  )

}

export default Header

/**
 *         
 * <div className={`
        absolute top-0 left-0 
        w-screen h-screen backdrop-blur-md 
        ${show_kyc?'':'hidden'}`}>
          <motion.div
            animate={{ opacity: show_kyc ? 1: 0, scale: show_kyc ? 1: 0}}
            transition={{
              duration: 0.4,
              delay: 0.2,
              ease: [0, 0.71, 0.2, 1.01]
            }}
            className={` ${show_kyc? '':'hidden'}
            fixed h-fit text-center text-black
            top-0 bottom-0 left-0 right-0 m-auto z-50
            p-8 rounded-2xl bg-neutral-100 opacity-50
            break-words max-w-[500px]
            w-fit`}>
              <h1 className='px-2 py-8 text-2xl rounded-2xl text-black'>Generate a zk-proof for KYC</h1>
              <p>
                {`Using Reclaim Protocol's Zero-Knowledge proof generation, 
                you can complete KYC without sharing your confidential information
                to unwanted parties.
                `}
              </p>
              <div 
              onClick={_=>{ 
                setVerificationLink(undefined);
                setShowKYC(!show_kyc);
              }}
              className='absolute top-0 right-0 px-4 py-2 hover:bg-red-900 bg-red-600 text-white rounded-tr-2xl'>X</div>
              {
                !verification_link
              ?
                <div>
                <ul>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await getVerificationReq('binance')}>Create proof with Binance</li>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await getVerificationReq('coinbase')}>Create proof with Coinbase</li>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await getVerificationReq('okx')}>Create proof with OKX</li>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await getVerificationReq('groww')}>Create proof with Groww</li>

                </ul>
              </div>
              :
              <div className={`items-center justify-center flex`}>
                <Canvas
                  text={verification_link}
                  options={{
                    errorCorrectionLevel: 'M',
                    margin: 3,
                    scale: 4,
                    width: 300,
                    color: {
                      dark:  '#000000',
                      light: '#FFFFFF',
                    },
                  }}
                />
              </div>}

          </motion.div>
        </div>

        <div className={`
        absolute top-0 left-0 
        w-screen h-screen backdrop-blur-md 
        ${show_wallets?'':'hidden'}`}>
          <motion.div
            animate={{ opacity: show_wallets ? 1: 0, scale: show_wallets ? 1: 0}}
            transition={{
              duration: 0.4,
              delay: 0.2,
              ease: [0, 0.71, 0.2, 1.01]
            }}
            className={` ${show_wallets? '':'hidden'}
            fixed bg-orange-300 h-fit text-center text-black
            top-0 bottom-0 left-0 right-0 m-auto z-50
            p-4 rounded-2xl 
            w-1/3`}>
              <h1 className=' px-2 py-4 text-2xl rounded-2xl font-casino'>Choose your wallet</h1>
              <ul>
                <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Keplr')}>Keplr</li>
                <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('MetaMask')}>MetaMask</li>
                <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Fina')}>Fina</li>
                <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Leap')}>Leap</li>
              </ul>
          </motion.div>
        </div>

        <div className='text-xl text-white py-2'>
          <span 
          onClick={async _=>{ 

            if (!dcasino.ready || !wallet_addr) {
              await swal_alert(`Please connect a wallet first`,'')
              return
            }
            setShowKYC(!show_kyc) 
          } 
          }
          className={
            `${
              user_info && user_info.kyc_validated
              ? 'bg-green-600'
              : 'bg-orange-600'} hover:bg-green-600
              p-2 mx-2 rounded-2xl opacity-50`}>{check}
          </span>

          <span 
          onClick={async _=> await handleAlias()}
          className={
            `${
              wallet_addr && !need_vk
              ? (dcasino.enable_alias?'bg-green-600':'bg-orange-600')
              :'bg-red-600'} 
              p-2 mx-2 rounded-2xl hover:bg-green-600`}>{alias}
          </span>
          <span 
          onClick={async _=> {

            if (!dcasino.ready || !wallet_addr) {
              await swal_alert(`Please connect a wallet first`,'')
              return
            }
        
            await dcasino.generate_vk()

          }}
          className={
            `${
              wallet_addr && !need_vk
              ? 'bg-green-600'
              :'bg-red-600 hover:bg-green-600'} 
              p-2 mx-2 rounded-2xl`}>{key}
          </span>
          <span 
          onClick={async _=> await handleConnect()}
          className={
            `${
              wallet_addr 
              ? 'bg-green-600 hover:bg-red-600'
              :'bg-red-600 hover:bg-green-600'} 
              p-2 mx-2 hover:opacity-100 opacity-50 rounded-2xl`}>{wallet}
          </span>

          <span 
         className={`p-2 rounded-2xl bg-neutral-800 w-fit duration-700 hidden`}>
          { 
            wallet_addr 
            ? <CopyToClipboard 
            onCopy={async _=> {await swal_success(`address ${dcasino.granter.address} copied`,'',1000)}}
            text={dcasino.granter.address}>
                <span className=''>
                  {wallet_addr}
                </span>
              </CopyToClipboard>
            : <span className=''>not connected</span>
          }
          </span>
        </div>
 */
