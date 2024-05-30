#!/usr/bin/python3
from datetime import datetime, date
import sys
sys.path.insert(1, '../')
from generate import generate
import gen_cfg

VERSION = sys.argv[1]
DCASINO_CONTRACT_ADDRESS = sys.argv[2]
DCASINO_CODE_ID = int(sys.argv[3])
CHAIN_ID = sys.argv[4]
LCD_URL = sys.argv[5]
VIDEO_POKER_CONTRACT_ADDRESS = sys.argv[6]
VIDEO_POKER_CODE_ID = int(sys.argv[7])
BLACK_JACK_21_CONTRACT_ADDRESS = sys.argv[8]
BLACK_JACK_21_CODE_ID = int(sys.argv[9])

PATH = './src'
FILENAME = 'constants.tsx'

HEADER = \
f'''
/******************************************************************************

VIDEO POKER FRONTEND {VERSION}
AUTOGENERATED {FILENAME.upper()} FILE

CREATED:        {date.today().strftime("%d %B %Y")}
AUTHOR:         YAESHA256
AFFILIATIONS:   --
                                                                               
******************************************************************************/




'''

INJECTIONS = \
{
    "METADATA" :
    f'''DCASINO_VERSION : string                = "{VERSION}";                        \n'''
    f'''DCASINO_CONTRACT_ADDRESS : string       = "{DCASINO_CONTRACT_ADDRESS}";       \n'''
    f'''DCASINO_CODE_ID : number                =  {DCASINO_CODE_ID};                 \n'''
    f'''CHAIN_ID : string                       = "{CHAIN_ID}";                       \n'''
    f'''LCD_URL : string                        = "{LCD_URL}";                        \n'''
    f'''VIDEO_POKER_CONTRACT_ADDRESS : string   = "{VIDEO_POKER_CONTRACT_ADDRESS}";   \n'''
    f'''VIDEO_POKER_CODE_ID: string             = "{VIDEO_POKER_CODE_ID}";            \n'''
    f'''BLACK_JACK_21_CONTRACT_ADDRESS : string = "{BLACK_JACK_21_CONTRACT_ADDRESS}"; \n'''
    f'''BLACK_JACK_21_CODE_ID: string           = "{BLACK_JACK_21_CODE_ID}";          \n''',

}

generate(PATH, FILENAME, HEADER, INJECTIONS, gen_cfg.OUT_DIR )



