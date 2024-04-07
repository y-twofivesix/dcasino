import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { PlainViewer, slide } from './components'
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants'
import { balance, user } from '@/src/queries'
import { IUser } from '@/src/interfaces'
import { swal_alert, swal_error, swal_success } from '@/src/helpers'
import { send_tx } from '@/src/transactions'

interface DappViewerProps {
    show_dapp: boolean
    setShowDapp: Dispatch<SetStateAction<boolean>>,
    dapp: JSX.Element
    dark: boolean
}


function DappViewer(props: DappViewerProps) {

  return (
    <>
     <PlainViewer
    show={props.show_dapp}
    setShow={props.setShowDapp}
    dark={props.dark}
    vert={false}
    >
      {props.dapp}
      </PlainViewer>
    </>
   
    
  )
}

export default DappViewer
