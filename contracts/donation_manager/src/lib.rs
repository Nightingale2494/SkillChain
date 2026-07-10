#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};
#[contract]
pub struct DonationManager;
#[contractimpl]
impl DonationManager { pub fn donate(env: Env, donor: Address, scholarship_id: u32, amount: i128) { donor.require_auth(); let key=(symbol_short!("don"), donor.clone(), scholarship_id); let total:i128=env.storage().persistent().get(&key).unwrap_or(0); env.storage().persistent().set(&key, &(total+amount)); env.events().publish((Symbol::new(&env,"DonationMade"), donor), (scholarship_id, amount)); } pub fn donor_total(env: Env, donor: Address, scholarship_id: u32) -> i128 { env.storage().persistent().get(&(symbol_short!("don"), donor, scholarship_id)).unwrap_or(0) } }
