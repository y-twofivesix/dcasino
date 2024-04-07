import React from 'react'

interface IBettingTableProps {
    bet : number,
    outcome: string,
    dealt: boolean,
    crt: boolean
};

interface ITableRowrops {
    title : string,
    outcome: string,
    bet: number,
    rewards: number[],
    dealt: boolean,
    crt: boolean
}

function TableRow(props: ITableRowrops ) {
    return (
    <div className={`table-row text-lg ${props.crt?'screen-glitch':''} ${ props.outcome == props.title ? ' bg-green-600 text-white': 'bg-neutral-800'}`}>
        <div className={`table-cell border-1 border-dotted border-black select-none px-4 ${props.outcome != props.title ? 'text-red-600 bg-blue-800': ''}  text-left`}>{props.title}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 1 ? (props.outcome==props.title? 'rainbow-bg':'bg-red-600'): ''}`}>{props.rewards[0]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 2 ? (props.outcome==props.title? 'rainbow-bg':'bg-red-600'): ''}`}>{props.rewards[1]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 3 ? (props.outcome==props.title? 'rainbow-bg':'bg-red-600'): ''}`}>{props.rewards[2]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 4 ? (props.outcome==props.title? 'rainbow-bg':'bg-red-600'): ''}`}>{props.rewards[3]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 5 ? (props.outcome==props.title? 'rainbow-bg':'bg-red-600'): ''}`}>{props.rewards[4]}</div>
    </div>
    )
}

function BettingTable( props : IBettingTableProps) {

  return (
    <div className=''>
        
        <div className={`table w-full text-base rounded-lg p-1`}>

            <div className="table-row-group">

                <TableRow crt={props.crt} title={'RoyalFlush'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[250, 500, 750, 1000, 1250]}/>
                <TableRow crt={props.crt} title={'StraightFlush'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[50, 100, 150, 200, 250]}/>
                <TableRow crt={props.crt} title={'FourOfAKind'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[25, 50, 75, 100, 125]}/>
                <TableRow crt={props.crt} title={'FullHouse'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[9, 18, 27, 36, 45]}/>
                <TableRow crt={props.crt} title={'Flush'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[6, 12, 18, 24, 30]}/>
                <TableRow crt={props.crt} title={'Straight'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[4, 8, 12, 16, 20]}/>
                <TableRow crt={props.crt} title={'ThreeOfAKind'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[3, 6, 9, 12, 15]}/>
                <TableRow crt={props.crt} title={'TwoPair'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[2, 4, 6, 8, 10]}/>
                <TableRow crt={props.crt} title={'JacksOrBetter'} dealt={props.dealt} bet={props.bet} outcome={props.outcome} rewards={[1, 2, 3, 4, 5]}/>

            </div>
        </div>

    </div>
  )
}

export default BettingTable