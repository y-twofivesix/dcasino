import React from 'react'

interface IBettingTableProps {
    bet : number,
    outcome: string
};

interface ITableRowrops {
    title : string,
    outcome: string,
    bet: number,
    rewards: number[]
}

function TableRow(props: ITableRowrops ) {
    return (
    <div className={`table-row ${props.outcome != props.title ? 'opacity-75': ''}`}>
        <div className={`table-cell select-none px-4 text-white  text-left bg-neutral-800`}>{props.title}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 1 ? (props.outcome==props.title? 'bg-green-600':'bg-red-600'): 'bg-neutral-800'}`}>{props.rewards[0]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 2 ? (props.outcome==props.title? 'bg-green-600':'bg-red-600'): 'bg-neutral-800'}`}>{props.rewards[1]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 3 ? (props.outcome==props.title? 'bg-green-600':'bg-red-600'): 'bg-neutral-800'}`}>{props.rewards[2]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 4 ? (props.outcome==props.title? 'bg-green-600':'bg-red-600'): 'bg-neutral-800'}`}>{props.rewards[3]}</div>
        <div className={`table-cell select-none px-4 text-white  text-left ${props.bet == 5 ? (props.outcome==props.title? 'bg-green-600':'bg-red-600'): 'bg-neutral-800'}`}>{props.rewards[4]}</div>
    </div>
    )
}

function BettingTable( props : IBettingTableProps) {



  return (
    <div className='p-8'>
        
        <div className={`table w-full text-lg rounded-lg p-2`}>

            <div className="table-row-group">

                <TableRow title={'RoyalFlush'} bet={props.bet} outcome={props.outcome} rewards={[250, 500, 750, 1000, 1250]}/>
                <TableRow title={'StraightFlush'} bet={props.bet} outcome={props.outcome} rewards={[50, 100, 150, 200, 250]}/>
                <TableRow title={'FourOfAKind'} bet={props.bet} outcome={props.outcome} rewards={[25, 50, 75, 100, 125]}/>
                <TableRow title={'FullHouse'} bet={props.bet} outcome={props.outcome} rewards={[9, 18, 27, 36, 45]}/>
                <TableRow title={'Flush'} bet={props.bet} outcome={props.outcome} rewards={[6, 12, 18, 24, 30]}/>
                <TableRow title={'Straight'} bet={props.bet} outcome={props.outcome} rewards={[4, 8, 12, 16, 20]}/>
                <TableRow title={'ThreeOfAKind'} bet={props.bet} outcome={props.outcome} rewards={[3, 6, 9, 12, 15]}/>
                <TableRow title={'TwoPair'} bet={props.bet} outcome={props.outcome} rewards={[2, 4, 6, 8, 10]}/>
                <TableRow title={'JacksOrBetter'} bet={props.bet} outcome={props.outcome} rewards={[1, 2, 3, 4, 5]}/>

            </div>
        </div>

    </div>
  )
}

export default BettingTable