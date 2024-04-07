import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { PlainViewer, slide } from './components'
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants'
import { balance, user } from '@/src/queries'
import { IUser } from '@/src/interfaces'
import { swal_alert, swal_error, swal_success } from '@/src/helpers'
import { send_tx } from '@/src/transactions'

interface ConsultProps {
    show_credits: boolean
    setShowCredits: Dispatch<SetStateAction<boolean>>,
    dark: boolean
}


function Credits(props: ConsultProps) {
  const [user_state, setUserInfo] = useState(undefined as undefined | IUser);
  const [bal, setBalance] = useState(undefined as undefined | string)
  const [pay_in, setPayIn] = useState(undefined as number | undefined)
  const [pay_out, setPayOut] = useState(undefined as number | undefined)


  const handlePayIn = useCallback (async ()=> {
    
    if (!dcasino.ready || !pay_in) return 
    if (!dcasino.vk_valid) {
      await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
      return
    }


    if ( user_state && !user_state.kyc_validated && ( pay_in > 50 || user_state?.credits >= 50)) {
      await swal_alert('Credits are temporarily capped at 50 for users without KYC');
      return
    }

    let tx = await send_tx(
      dcasino.DCASINO_CONTRACT_ADDRESS,
      dcasino.dcasino_code_hash, 
      { pay_in : { amount: pay_in }},
      [{ amount: String( pay_in * 1_000_000 ) , denom: 'uscrt' }], 
      66_000);

  if (typeof tx === 'string') {
      await swal_error (tx);
      return;
  } else {
    await swal_success('transaction complete!', '',1500)
  }
}, [user_state, pay_in])

const handlePayOut = useCallback (async ()=> {
    
  if (!dcasino.ready || !pay_out) return 
  if (!dcasino.vk_valid) {
    await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
    return
  }


  let tx = await send_tx(
    dcasino.DCASINO_CONTRACT_ADDRESS,
    dcasino.dcasino_code_hash, 
    { pay_out : { amount: pay_out }},
    [], 
    66_000);

if (typeof tx === 'string') {
    await swal_error (tx);
    return;
} else {
  await swal_success('transaction complete!', '',1500)
}
}, [pay_out])

  const do_query = useCallback(async () => {

    if (!dcasino.ready) return

    let user_res = await user()
    if (user_res.is_ok) {
      setUserInfo(user_res.inner as IUser)
    } 
    else if (ERR_UNAUTHORISED.test(user_res.inner as string)) {
      dcasino.vk_valid = false;
    }

    let bal_ = await balance();
    setBalance(bal_[0])

  }, []);

  useEffect(function () {
    do_query();
    const id = setInterval(do_query, 5_000);
    return () => clearInterval(id);
  }, [])

  
  return (
    <>
     <PlainViewer
    show={props.show_credits}
    setShow={props.setShowCredits}
    dark={props.dark}
    vert={false}
      >
      <div className='px-10'>
        <table className='m-auto'>
          <tbody>
            <tr className='p-2 bg-black text-white'>
              <td className='p-2 text-left'>Peg</td>
              <td className='p-2 text-right'>1 CREDIT = 1 SCRT</td>
            </tr>
            <tr className='p-2'>
              <td className='p-2 text-left'>My Credits</td>
              <td className='text-right'>{user_state? user_state.credits:'-'}</td>
            </tr>
            <tr className='p-2'>
              <td className='p-2 text-left'>My Scrt Balance</td>
              <td className='p-2 text-right'>{bal} scrt</td>
            </tr>
          </tbody>
        </table>

        <div    
        className='m-auto items-center justify-center py-2 px-10 text-neutral-800 flex justify-items'>

            <div className='p-1'>
                <input
                    type="number"
                    min={1}
                    value={pay_in}
                    onChange={e => { 
                    let input_value = parseInt(e.currentTarget.value);
                    setPayIn(input_value); 
                }} 
                className={`
                outline-none p-2 w-[250px] text-center text-black`}
                placeholder='pay in'/>
            </div>
            
            <div className='p-1'>
              <div 
              onClick={async _=> { handlePayIn() }}
              className="outline-none p-2 text-neutral-200 hover:bg-green-600 bg-green-800 w-[150px] text-center">
                  Pay In
              </div>
            </div>
            
        </div>

        <div    
        className='m-auto items-center justify-center py-2 px-10 text-neutral-800 flex justify-items'>

                  <div className='p-1'>
                    <input
                        type="number"
                        min={1}
                        value={pay_out}
                        onChange={e => { 
                        let input_value = parseInt(e.currentTarget.value);
                        setPayOut(input_value); 
                    }} 
                    className={`
                    outline-none px-4 py-2 w-[250px] text-center text-black`}
                    placeholder='pay out'/>
                </div>


            <div className='p-1'>
              <div 
              onClick={async _=> { handlePayOut() }}
              className="outline-none px-4 py-2 text-neutral-200 hover:bg-green-600 bg-green-800 w-[150px] text-center">
                  Pay Out
              </div>
            </div>
            
        </div>

      </div>
      </PlainViewer>
    </>
   
    
  )
}

export default Credits
