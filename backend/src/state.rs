type Addr = String;
type ViewingKey = String;

use crate::instance::Instance;
use secret_toolkit::serialization::Json;
use secret_toolkit::storage::{Keymap, KeymapBuilder, WithoutIter };

/******************************************************************************
 Globals
*******************************************************************************/

// game instances
pub static INSTANCES: Keymap<Addr, Instance, Json, WithoutIter> =
    KeymapBuilder::new(b"instances").without_iter().build();

// viewing keys
pub static VIEWING_KEYS: Keymap<Addr, ViewingKey, Json, WithoutIter> =
    KeymapBuilder::new(b"viewing_keys").without_iter().build();