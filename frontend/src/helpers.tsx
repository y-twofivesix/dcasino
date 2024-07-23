import { SecretNetworkClient, MetaMaskWallet, TxResponse, MsgExecuteContract, Msg, Wallet } from 'secretjs';
import { QueryBalanceResponse } from 'secretjs/dist/extensions/snip1155/msg/getBalance';
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants';
import Swal from 'sweetalert2';
import { alias_mnem_info, alias_of_info, user } from './queries';

export function green(text : string) {
  return (<p className="inline text-green-600 font-ibm">{text}</p>)
}


// maps a cad number to the corresponding image name
export function numberToImg(num : number | undefined): string {

  if ( num == undefined || num == 255) {
    return '/images/dcasinotiledbordered.webp';
  }

  let [suit, rank] = translate_card(num);

  let rank_str = '';
  let suit_str = '';

  switch (rank) {
      case 0:
          rank_str = 'a'; // ace
          break;
      case 9:
          rank_str = '10' // 10 (only image name with two digits)
          break;
      case 10:
          rank_str = 'j' //jack
          break;
      case 11:
          rank_str = 'q' //queen
          break;
      case 12:
          rank_str = 'k' //king
          break;
      default:
          rank_str = JSON.stringify(rank+1)

  }

  switch (suit) {
      case 0:
          suit_str = 'c'; // clubs
          break;
      case 1:
          suit_str = 'd' // diamonds
          break;
      case 2:
          suit_str = 's' // spades
          break;
      case 3:
          suit_str = 'h' //hearts
          break;
  }
      
  return `/deck2/${rank_str.concat(suit_str)}.webp`;
}

export function translate_card(value : number): [number, number] {

  let quot = Math.floor(value / 13);
  let rem = value % 13;

  let suit = 0
  if (quot == 0 || quot == 4 || quot == 8  || quot == 12 ) {suit = 0} else
  if (quot == 1 || quot == 5 || quot == 9  || quot == 13 ) {suit = 1} else
  if (quot == 2 || quot == 6 || quot == 10 || quot == 14 ) {suit = 2} else
  if (quot == 3 || quot == 7 || quot == 11 || quot == 15 ) {suit = 3} 

  return [suit, rem]
}


/******************************************************************************
random string
******************************************************************************/

export function random_string() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 64) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/******************************************************************************
denom conversion
******************************************************************************/

const microdenoms = ['uscrt'];
export function currency_str(amount : string, denom : string) : [string, string] {
  let amount_int = parseInt(amount);
  let amount_str = (isNaN(amount_int) ? 'NaN' : String(amount_int.toFixed(2)));

  if (microdenoms.includes(denom)) {

    denom = denom.substring(1);
    amount_str = (isNaN(amount_int) ? 'NaN' : String((amount_int/1e6).toFixed(2)))
  }
  return [amount_str, denom]
}

export function red(text : string) {
  return (<p className="inline text-red-600 font-ibm">{text}</p>)
}

export function normal(text : string) {
  return (<p className="inline font-ibm">{text}</p>)
}

export const init_metamask = async (): Promise<SecretNetworkClient| null> => {

  let metamask = null;
  //@ts-ignore
  if (window.ethereum) {
    //@ts-ignore
    metamask = window.ethereum;
  } else {
    await swal_error('MetaMask wallet not detected!', '', 2000);
    return null
  }

  //@ts-ignore
  const [ethAddress] = await metamask.request({
    method: "eth_requestAccounts",
  });

  //@ts-ignore
  const wallet = await MetaMaskWallet.create(metamask, ethAddress);

  const chainId =  dcasino.CHAIN_ID;

  const secretcli : SecretNetworkClient = new SecretNetworkClient({
    url: dcasino.LCD_URL,
    chainId: chainId,
    wallet: wallet,
    walletAddress: wallet.address,
  });

  return secretcli
}

export const init_leap = async (): Promise<SecretNetworkClient | null> => {

  let leap = null;
    //@ts-ignore
    if (window.leap) {
      //@ts-ignore
      leap = window.leap;
    } else {
      await swal_error('Leap wallet not detected!', '', 2000);
      return null
    }

    const chainId =  dcasino.CHAIN_ID;
    const key = await leap.getKey(chainId);
    window.addEventListener('leap_keystorechange', leap.getKey);

    const offlineSigner = await leap.getOfflineSignerOnlyAmino(chainId);
    const accounts = await offlineSigner.getAccounts();
      /*@ts-ignore */
    const enigmaUtils = window.getEnigmaUtils(chainId);

    const secretcli : SecretNetworkClient = new SecretNetworkClient({
      url: dcasino.LCD_URL,
      chainId: chainId,
      wallet: offlineSigner,
      walletAddress: accounts[0].address,
      encryptionUtils: enigmaUtils,
    });

    return secretcli
  

}

export const init_fina = async (): Promise<SecretNetworkClient | null> => {
  //@ts-ignore
  if (window.fina) {
    //@ts-ignore
    return await init_keplr();
  } else {
    await swal_error('Fina wallet not detected!', '', 2000);
    return null;
  }
}


export const init_keplr = async (): Promise<SecretNetworkClient | null> => {
  let keplr = null;

  //@ts-ignore
  if (window.keplr) {
      //@ts-ignore
    keplr = window.keplr;
  } else {
    await swal_error('Keplr wallet not detected!', '', 2000);
    return null
  }
  const chainId = dcasino.CHAIN_ID;

  // Enabling before using the Keplr is recommended.
  // This method will ask the user whether to allow access if they haven't visited this website.
  // Also, it will request that the user unlock the wallet if the wallet is locked.

  await keplr.enable(chainId);

  /*@ts-ignore */
  const offlineSigner = window.getOfflineSignerOnlyAmino(chainId);

  /*@ts-ignore */
  const enigmaUtils = window.getEnigmaUtils(chainId);


  
  // You can get the address/public keys by `getAccounts` method.
  // It can return the array of address/public key.
  // But, currently, Keplr extension manages only one address/public key pair.
  // XXX: This line is needed to set the sender address for SigningCosmosClient.
  const accounts = await offlineSigner.getAccounts();
  
  // Initialize the gaia api with the offline signer that is injected by Keplr extension.
  /*@ts-ignore */
  const secretcli : SecretNetworkClient = new SecretNetworkClient({
    url: dcasino.LCD_URL,
    chainId: chainId,
    wallet: offlineSigner,
    walletAddress: accounts[0].address,
    encryptionUtils: enigmaUtils,
  });


  return secretcli;
}

const validate_alias = async () : Promise<boolean> => {

  let storage_cli_mnem = window.localStorage.getItem(`dcasino_${dcasino.granter.address}_alias_cli_mnem`);
  if (storage_cli_mnem) {

    let wallet = new Wallet(storage_cli_mnem); 
    const local_store_grantee = new SecretNetworkClient({
      url: dcasino.LCD_URL,
      chainId: dcasino.CHAIN_ID,
      wallet: wallet,
      walletAddress: wallet.address,
    });


    let alias_of = await alias_of_info();
    if (alias_of.is_ok && alias_of.inner.alias_of == dcasino.granter.address ) {
      dcasino.set_cli(local_store_grantee);
      dcasino.set_enable_alias(true);
      return true;
    }

    // try to retrieve existing alias of any
    let alias_mnem = await alias_mnem_info()
    if (alias_mnem.is_ok) {

      let mnem = alias_mnem.inner.mnem as string;
      let wallet = new Wallet(mnem); 
      const server_store_grantee = new SecretNetworkClient({
        url: dcasino.LCD_URL,
        chainId: dcasino.CHAIN_ID,
        wallet: wallet,
        walletAddress: wallet.address,
      });

      dcasino.set_cli(server_store_grantee);
      dcasino.set_enable_alias(true);
      window.localStorage.setItem(`dcasino_${dcasino.granter.address}_alias_cli_mnem`, mnem);

      return true;
    }
    // wipe the old one
    window.localStorage.removeItem(`dcasino_${dcasino.granter.address}_alias_cli_mnem`);
    return false;

  } else {

        // try to retrieve existing alias from server
    let alias_mnem = await alias_mnem_info()
    if (alias_mnem.is_ok) {

      let mnem = alias_mnem.inner.mnem as string;
      let wallet = new Wallet(mnem); 
      const server_store_grantee = new SecretNetworkClient({
        url: dcasino.LCD_URL,
        chainId: dcasino.CHAIN_ID,
        wallet: wallet,
        walletAddress: wallet.address,
      });

      dcasino.set_cli(server_store_grantee);
      dcasino.set_enable_alias(true);
      window.localStorage.setItem(`dcasino_${dcasino.granter.address}_alias_cli_mnem`, mnem);

      return true;
    }
    return false
  }
}


export const do_init = async (wallet: string) => {
  let secretcli = null;

  if (wallet=='Keplr') secretcli = await init_keplr()
  .catch(async e => { await swal_error(JSON.stringify(e))});

  else if (wallet=='MetaMask') secretcli = await init_metamask()
  .catch(async e => { await swal_error(JSON.stringify(e))});

  else if (wallet=='Fina') secretcli = await init_fina()
  .catch(async e => { await swal_error(JSON.stringify(e))});

  else if (wallet=='Leap') secretcli = await init_leap()
  .catch(async e => { await swal_error(JSON.stringify(e))});

  
  if (!secretcli) {
    return false;
  }

  dcasino.set_granter(secretcli);
  dcasino.set_cli(secretcli);
  await dcasino.set_code_hash(secretcli);

  const { balance } = await secretcli?.query.bank.balance({
    address: secretcli.address,
    denom: "uscrt",
  }) as QueryBalanceResponse;

  if (parseInt(balance.amount) == 0) {
    await swal_alert('You wont be able to perform basic actions (They will simply fail).', 'Your balance is zero!');
  }
  
  dcasino.ready = true;
  //document.title = `dCasino${dcasino.CHAIN_ID.includes('pulsar') ? ' (testnet)' : ''}`

  return true;

}

export const check_env = async () => {


  let storage_vk = window.localStorage.getItem(`dcasino_${dcasino.granter.address}_vk`);

  if (storage_vk) {
    dcasino.set_viewing_key(storage_vk);
  }

  if (!dcasino.dcasino_code_hash && !dcasino.video_poker_code_hash) {
    await dcasino.set_code_hash();
  }

  await validate_alias();

  return storage_vk;

}

export const swal_confirm = async ( message : string, title : string = '') : Promise<boolean> => {
  let result = false;
  await Swal.fire({
    title: title,
    text: message,  
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: 'Go!',
    denyButtonText: `No!`,
    backdrop: `rgba(0,0,123,0.4)`
  }).then( (inner_result) => { result = inner_result.isConfirmed} );
  return result;
}

export const swal_input = async ( message : string, title : string = '', placeholder : string = '', can_deny = true) : Promise<string> => {
  let result = '';
  await Swal.fire({
    title: title,
    text: message,
    showDenyButton: can_deny,
    denyButtonText: `Cancel`,
    backdrop: `rgba(0,0,123,0.4)`,
    html:
    `
    <div>${message}</div>
    <input id="swal-input" class="swal2-input" placeholder="${placeholder}">
    `,
    preConfirm: function () {
       //@ts-ignore
      return document.getElementById('swal-input').value
    },
  }).then(function (res) {
    if (!res.isDenied) {
      result = res.value;
    }
  })
  return result;
}

export const swal_error = async ( message : string, title : string = '', timer = 0) => {

  if (timer) {
    await Swal.fire ({
      title: title,
      icon: "error",
      text: message,
      timer: timer,
    });
  } else {
    await Swal.fire ({
      title: title,
      icon: "error",
      text: message,
      backdrop: `rgba(0,0,123,0.4)`,

    });
  }
}

export const swal_alert = async ( message : string, title : string = '',  timer = 0) => {

  if (timer) {
    await Swal.fire ({
      title: title,
      icon: "info",
      text: message,
      timer: timer
    });
  } else {
    await Swal.fire ({
      title: title,
      icon: "info",
      text: message,
    });
  }
}

export const swal_success = async ( message: string, title: string = '', timer = 0) => {


  if (timer != 0) {
    await Swal.fire ({
      title: title,
      icon: "success",
      text: message,
      timer: timer
    });
  } else {
    await Swal.fire ({
      title: title,
      icon: "success",
      text: message,
      backdrop: `rgba(0,0,123,0.4)`,
    });
  }

}



